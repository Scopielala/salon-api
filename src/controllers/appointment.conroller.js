import { catchAsync } from '../utils/catchAsync.js';

// Study this file carefully — it's a good example of how to keep controllers thin and boring, and

export function createAppointmentController(appointmentService) {
  return {
    create: catchAsync(async (req, res) => {
      const appointment = await appointmentService.createAppointment(req.client.id, req.body);
      res.status(201).json(appointment);
    }),

    listMine: catchAsync(async (req, res) => {
      res.json(await appointmentService.getMyAppointments(req.client.id));
    }),

    listAll: catchAsync(async (req, res) => {
      res.json(await appointmentService.getAllAppointments());
    }),

    updateStatus: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid appointment id' });
      const appointment = await appointmentService.updateStatus(id, req.body);
      res.json(appointment);
    }),
  };
}