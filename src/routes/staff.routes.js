import { Router } from 'express';

export function createStaffRouter(staffController) {
  const router = Router();
  router.post('/', staffController.create);
  router.get('/', staffController.getAll);
  return router;
}