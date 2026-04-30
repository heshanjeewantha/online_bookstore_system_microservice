require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { seedDefaultBooks } = require('./seeders/bootstrapBooks');
const bookRoutes = require('./routes/bookRoutes');
const internalRoutes = require('./routes/internalRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/books', bookRoutes);
app.use('/internal/books', internalRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.ENABLE_BOOTSTRAP_BOOKS === 'true') {
      await seedDefaultBooks();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Book service running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start book service: ${error.message}`);
    process.exit(1);
  }
};

startServer();
