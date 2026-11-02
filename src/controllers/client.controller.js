import { catchAsync } from '../utils/catchAsync.js';

export function createClientController(clientService) {
  return {
    identify: catchAsync(async (req, res) => {
      const result = await clientService.identify(req.body);
      res.status(200).json(result);
    }),

    me: catchAsync(async (req, res) => {
      const client = await clientService.getProfile(req.client.id);
      res.json(client);
    }),
  };
}