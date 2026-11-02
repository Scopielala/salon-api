import { Router } from 'express';

export function createAppointmentRouter(appointmentController) {
  const router = Router();
  router.get('/', appointmentController.listAll);
  router.put('/:id', appointmentController.updateStatus);
  return router;
}