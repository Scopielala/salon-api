import { Router } from 'express';
import { requireClientAuth } from '../middleware/auth.middleware';

export function createClientRouter(clientController) {
  const router = Router();

  router.post('/identify', clientController.identify);
  router.get('/me', requireClientAuth, clientController.me);

  return router;
}