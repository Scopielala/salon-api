import { Router } from 'express';

export function createAuthRouter(authController) {
  const router = Router();
  router.post('/staff/login', authController.staffLogin);
  return router;
}