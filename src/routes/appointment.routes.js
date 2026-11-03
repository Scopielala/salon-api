import { Router } from 'express';

export function createAppointmentRouter(appointmentController) {
  const router = Router();
  router.get('/', appointmentController.listAll);
  router.put('/:id', appointmentController.updateStatus);
  router.get('/:id/completion-draft', appointmentController.completionDraft);
router.post('/:id/complete', appointmentController.complete);
  return router;
}