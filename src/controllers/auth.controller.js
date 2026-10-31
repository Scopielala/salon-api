import { catchAsync } from '../utils/catchAsync.js';

export function createAuthController(authService) {
  return {
    staffLogin: catchAsync(async (req, res) => {
      const { email, password } = req.body;
      const result = await authService.staffLogin(email, password);
      res.json(result);
    }),

    staffRefresh: catchAsync(async (req, res) => {
      const result = await authService.refreshStaff(req.body.refreshToken);
      res.json(result);
    }),

    staffLogout: catchAsync(async (req, res) => {
      await authService.logoutStaff(req.body.refreshToken);
      res.status(204).end();
    }),
  };
}
