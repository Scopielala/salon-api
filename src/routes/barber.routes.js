import { Router } from 'express';
import {requireRole} from '../middleware/auth.middleware.js';

export function createBarberRouter(barberController) {
  const router = Router();

  router.get('/', barberController.getAll);
  router.get('/:id', barberController.getById);
  router.post('/', barberController.create);
  router.put('/:id', barberController.update);
  router.delete('/:id', requireRole('admin'), barberController.remove);

  return router;
}