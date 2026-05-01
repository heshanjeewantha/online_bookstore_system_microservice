require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { seedDefaultUsers } = require('./seeders/bootstrapUsers');
const userRoutes = require('./routes/userRoutes');
const internalRoutes = require('./routes/internalRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

app.use('/users', userRoutes);
app.use('/internal/users', internalRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.ENABLE_BOOTSTRAP_USERS === 'true') {
      await seedDefaultUsers();
    }

    app.listen(PORT, () => {
      console.log(`User service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start user service: ${error.message}`);
    process.exit(1);
  }
};

startServer();
