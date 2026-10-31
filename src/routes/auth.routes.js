import { Router } from 'express';

export function createAuthRouter(authController) {
  const router = Router();
  router.post('/staff/login', authController.staffLogin);
  router.post('/staff/refresh', authController.staffRefresh);
  router.post('/staff/logout', authController.staffLogout);
  return router;
}
