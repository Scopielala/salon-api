import { catchAsync } from '../utils/catchAsync.js';

export function createAuthController(authService) {
  return {
    staffLogin: catchAsync(async (req, res) => {
      const { email, password } = req.body;
      const result = await authService.staffLogin(email, password);
      res.json(result);
    }),
  };
}