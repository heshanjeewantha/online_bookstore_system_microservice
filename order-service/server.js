require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

app.use('/orders', orderRoutes);
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
