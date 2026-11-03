import { catchAsync } from '../utils/catchAsync.js';

export function createClientController(clientService) {
  return {
    clientLogIn: catchAsync(async (req, res) => {
      const result = await clientService.clientLogin(req.body);
      res.status(200).json(result);
    }),

    clientRefresh: catchAsync(async (req, res) => {
      const result = await clientService.refreshClient(req.body.refreshToken);
      res.json(result);
    }),

    clientLogout: catchAsync(async (req, res) => {
      await clientService.logoutClient(req.body.refreshToken);
      res.status(204).end();
    }),

    getProfile: catchAsync(async (req, res) => {
      const client = await clientService.getProfile(req.client.id);
      res.json(client);
    }),
  };
}
