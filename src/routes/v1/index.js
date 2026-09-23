import { Router } from 'express';
import { createBarberRouter } from '../barber.routes.js';
import { createServiceRouter } from '../service.routes.js';
import { createServiceRecordRouter } from '../serviceRecord.routes.js';

export function createV1Router({ barberController, serviceController, serviceRecordController }) {
  const router = Router();

  router.use('/barbers', createBarberRouter(barberController));
  router.use('/services', createServiceRouter(serviceController));
  router.use('/service-records', createServiceRecordRouter(serviceRecordController));

  return router;
}