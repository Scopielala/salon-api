import { catchAsync } from '../utils/catchAsync.js';

export function createServiceController(serviceService) {
  return {
    getAll: catchAsync(async (req, res) => {
      const services = await serviceService.getAllServices();
      res.json(services);
    }),

    getById: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service id' });
      const service = await serviceService.getServiceById(id);
      res.json(service);
    }),

    create: catchAsync(async (req, res) => {
      const service = await serviceService.createService(req.body);
      res.status(201).json(service);
    }),

    update: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service id' });
      const service = await serviceService.updateService(id, req.body);
      res.json(service);
    }),

    remove: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service id' });
      await serviceService.deleteService(id);
      res.status(204).send();
    }),
  };
}