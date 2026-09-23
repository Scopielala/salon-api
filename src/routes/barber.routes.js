import { Router } from 'express';

export function createBarberRouter(barberController) {
  const router = Router();

  router.get('/', barberController.getAll);
  router.get('/:id', barberController.getById);
  router.post('/', barberController.create);
  router.put('/:id', barberController.update);
  router.delete('/:id', barberController.remove);

  return router;
}