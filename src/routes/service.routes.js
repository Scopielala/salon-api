import { Router } from 'express';

export function createServiceRouter(serviceController) {
  const router = Router();

  router.get('/', serviceController.getAll);
  router.get('/:id', serviceController.getById);
  router.post('/', serviceController.create);
  router.put('/:id', serviceController.update);
  router.delete('/:id', serviceController.remove);

  return router;
}