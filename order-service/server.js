require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const orderRoutes = require('./routes/orderRoutes');
const internalRoutes = require('./routes/internalRoutes');


const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);


const app = express();

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());


app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

app.use('/orders', orderRoutes);
app.use('/internal/orders', internalRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Order service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start order service: ${error.message}`);
    process.exit(1);
  }
};

startServer();
