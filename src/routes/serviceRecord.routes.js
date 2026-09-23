import { Router } from 'express';

export function createServiceRecordRouter(serviceRecordController) {
  const router = Router();

  router.get('/', serviceRecordController.getAll);
  router.get('/:id', serviceRecordController.getById);
  router.post('/', serviceRecordController.create);
  router.put('/:id', serviceRecordController.update);
  router.delete('/:id', serviceRecordController.remove);

  return router;
}