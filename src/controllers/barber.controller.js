import { catchAsync } from '../utils/catchAsync.js';

export function createBarberController(barberService) {
  return {
    getAll: catchAsync(async (req, res) => {
      const barbers = await barberService.getAllBarbers();
      res.json(barbers);
    }),

    getById: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid barber id' });
      const barber = await barberService.getBarberById(id);
      res.json(barber);
    }),

    create: catchAsync(async (req, res) => {
      const barber = await barberService.createBarber(req.body);
      res.status(201).json(barber);
    }),

    update: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid barber id' });
      const barber = await barberService.updateBarber(id, req.body);
      res.json(barber);
    }),

    remove: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid barber id' });
      await barberService.deleteBarber(id);
      res.status(204).send();
    }),
  };
}