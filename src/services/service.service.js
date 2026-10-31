import { AppError } from '../utils/appError.js';

// Upper bound so a typo like 3000 can't quietly block a barber's calendar for two days.
// 8 hours feels generous for a single service, and it's easy to raise if the salon ever offers longer ones.
const MAX_DURATION_MINUTES = 480;

// Price and duration are now validated in more than one place (create + update),
// so each rule lives in one helper. Two copies of the same check would eventually drift apart.
function parsePrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError('defaultPrice must be a positive number', 400);
  }
  return price;
}

// Whole minutes only: the appointment service adds these up, and fractional minutes
// would make calendar slots messy for no real benefit.
function parseDuration(value) {
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes <= 0 || minutes > MAX_DURATION_MINUTES) {
    throw new AppError(
      `defaultDurationMinutes must be a whole number between 1 and ${MAX_DURATION_MINUTES}`,
      400
    );
  }
  return minutes;
}

export function createServiceService(serviceRepository) {
  return {
    async getAllServices() {
      return serviceRepository.findAll();
    },

    async getServiceById(id) {
      const service = await serviceRepository.findById(id);
      if (!service) {
        throw new AppError(`Service with id ${id} not found`, 404);
      }
      return service;
    },

    async createService(data) {
      const name = data.name?.trim();
      if (!name) {
        throw new AppError('Service name is required', 400);
      }

      const serviceData = { name, defaultPrice: parsePrice(data.defaultPrice) };

      // Only validate and pass the duration when the caller actually sent one.
      // Leaving the key out lets the schema's @default(30) apply, whereas passing
      // an explicit undefined/null could behave differently, so I'd rather not rely on that.
      if (data.defaultDurationMinutes !== undefined) {
        serviceData.defaultDurationMinutes = parseDuration(data.defaultDurationMinutes);
      }

      try {
        return await serviceRepository.create(serviceData);
      } catch (err) {
        if (err.code === 'P2002') {
          throw new AppError(`A service named "${name}" already exists`, 409);
        }
        throw err;
      }
    },

    async updateService(id, data) {
      const updateData = {};

      if (data.name !== undefined) {
        const name = data.name.trim();
        if (!name) {
          throw new AppError('Service name cannot be empty', 400);
        }
        updateData.name = name;
      }

      if (data.defaultPrice !== undefined) {
        updateData.defaultPrice = parsePrice(data.defaultPrice);
      }

      // Changing a duration here only affects FUTURE bookings. Existing appointments
      // snapshotted their own durationMinutes when they were created, so history stays intact.
      if (data.defaultDurationMinutes !== undefined) {
        updateData.defaultDurationMinutes = parseDuration(data.defaultDurationMinutes);
      }

      try {
        return await serviceRepository.update(id, updateData);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Service with id ${id} not found`, 404);
        }
        if (err.code === 'P2002') {
          throw new AppError(`A service named "${updateData.name}" already exists`, 409);
        }
        throw err;
      }
    },

    async deleteService(id) {
      try {
        await serviceRepository.remove(id);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Service with id ${id} not found`, 404);
        }
        if (err.code === 'P2003') {
          throw new AppError('Cannot delete a service that has existing service records', 409);
        }
        throw err;
      }
    },
  };
}