import { catchAsync } from '../utils/catchAsync.js';

export function createServiceRecordController(serviceRecordService) {
  return {
    getAll: catchAsync(async (req, res) => {
      const records = await serviceRecordService.getAllRecords();
      res.json(records);
    }),

    getById: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service record id' });
      const record = await serviceRecordService.getRecordById(id);
      res.json(record);
    }),

    create: catchAsync(async (req, res) => {
      const record = await serviceRecordService.createRecord(req.body);
      res.status(201).json(record);
    }),

    update: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service record id' });
      const record = await serviceRecordService.updateRecord(id, req.body);
      res.json(record);
    }),

    remove: catchAsync(async (req, res) => {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service record id' });
      await serviceRecordService.deleteRecord(id);
      res.status(204).send();
    }),
  };
}