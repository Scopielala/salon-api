import { AppError } from '../utils/appError.js';

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

      const defaultPrice = Number(data.defaultPrice);
      if (!Number.isFinite(defaultPrice) || defaultPrice <= 0) {
        throw new AppError('defaultPrice must be a positive number', 400);
      }

      try {
        return await serviceRepository.create({ name, defaultPrice });
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
        const defaultPrice = Number(data.defaultPrice);
        if (!Number.isFinite(defaultPrice) || defaultPrice <= 0) {
          throw new AppError('defaultPrice must be a positive number', 400);
        }
        updateData.defaultPrice = defaultPrice;
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