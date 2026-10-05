import { AppError } from '../utils/appError.js';
import { normalizePhoneNumber } from '../utils/phoneNormalizer.js';
import { signToken } from '../utils/jwt.js';

export function createClientService(clientRepository) {
  return {
    async identify(data) {
      const normalizedPhone = normalizePhoneNumber(data.phone);
      if (!normalizedPhone) {
        throw new AppError('A valid phone number is required', 400);
      }

      const name = data.name?.trim();
      const existing = await clientRepository.findByPhone(normalizedPhone);

      if (!existing && !name) {
        throw new AppError('Name is required for first-time registration', 400);
      }

      const client = await clientRepository.upsertByPhone(normalizedPhone, name);

      const token = signToken(
        { id: client.id, type: 'client' },
        process.env.JWT_CLIENT_SECRET,
        process.env.JWT_CLIENT_EXPIRES_IN
      );

      return { token, client };
    },

    async getProfile(clientId) {
      const client = await clientRepository.findById(clientId);
      if (!client) {
        throw new AppError('Client not found', 404);
      }
      return client;
    },
  };
}