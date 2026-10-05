import 'dotenv/config';
import express from 'express';
import prisma from './config/prisma.js';
import { container } from './container.js';
import { createV1Router } from './routes/v1/index.js';

const app = express();
app.use(express.json());

const v1Router = createV1Router(container);
app.use('/api/v1', v1Router);

app.get('/health', async (req, res) => {
  const barberCount = await prisma.barber.count();
  res.json({ status: 'ok', barbers: barberCount });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  const statusCode = err.statusCode || 500;
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }
  res.status(statusCode).json({
    error: err.isOperational ? err.message : 'Something went wrong. Please try again.',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Salon API listening on port ${PORT}`);
});