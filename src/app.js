import 'dotenv/config';
import express from 'express';
import prisma from './config/prisma.js';

import { createBarberRepository } from './repositories/barber.repository.js';
import { createBarberService } from './services/barber.service.js';
import { createBarberController } from './controllers/barber.controller.js';

import { createServiceRepository } from './repositories/service.repository.js';
import { createServiceService } from './services/service.service.js';
import { createServiceController } from './controllers/service.controller.js';

import { createServiceRecordRepository } from './repositories/serviceRecord.repository.js';
import { createServiceRecordService } from './services/serviceRecord.service.js';
import { createServiceRecordController } from './controllers/serviceRecord.controller.js';

import { createV1Router } from './routes/v1/index.js';

const app = express();
app.use(express.json());

// Wiring — construct repositories, services, controllers
const barberRepository = createBarberRepository(prisma);
const barberService = createBarberService(barberRepository);
const barberController = createBarberController(barberService);

const serviceRepository = createServiceRepository(prisma);
const serviceService = createServiceService(serviceRepository);
const serviceController = createServiceController(serviceService);

const serviceRecordRepository = createServiceRecordRepository(prisma);
const serviceRecordService = createServiceRecordService(
  serviceRecordRepository,
  barberRepository,
  serviceRepository
);
const serviceRecordController = createServiceRecordController(serviceRecordService);

// Mount the versioned router — this is the only router-related import app.js needs
const v1Router = createV1Router({ barberController, serviceController, serviceRecordController });
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