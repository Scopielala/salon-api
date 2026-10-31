import { Router } from 'express';
import { requireClientAuth } from '../middleware/auth.middleware.js';

export function createClientRouter(clientController) {
  const router = Router();

  router.post('/login', clientController.clientLogIn);
  router.post('/refresh', clientController.clientRefresh);
  router.post('/logout', clientController.clientLogout);
  router.get('/profile', requireClientAuth, clientController.getProfile);

  return router;
}
