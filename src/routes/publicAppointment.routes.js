import { Router } from 'express';

export function createPublicAppointmentRouter(appointmentController) {
  const router = Router();
  router.post('/', appointmentController.create);
  router.get('/', appointmentController.listMine);
  return router;
}