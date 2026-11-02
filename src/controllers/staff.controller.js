import { catchAsync } from '../utils/catchAsync.js';

export function createStaffController(staffService) {
  return {
    create: catchAsync(async (req, res) => {
      const staff = await staffService.createStaff(req.body);
      res.status(201).json(staff);
    }),
    getAll: catchAsync(async (req, res) => {
      res.json(await staffService.listStaff());
    }),
  };
}