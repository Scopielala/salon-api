import { AppError } from '../utils/appError.js';

export function createBarberService(barberRepository) {
  return {
    async getAllBarbers() {
      return barberRepository.findAll();
    },

    async getBarberById(id) {
      const barber = await barberRepository.findById(id);
      if (!barber) {
        throw new AppError(`Barber with id ${id} not found`, 404);
      }
      return barber;
    },

    async createBarber(data) {
      const name = data.name?.trim();
      if (!name) {
        throw new AppError('Barber name is required', 400);
      }

      try {
        return await barberRepository.create({ name });
      } catch (err) {
        if (err.code === 'P2002') {
          throw new AppError(`A barber named "${name}" already exists`, 409);
        }
        throw err;
      }
    },

    async updateBarber(id, data) {
      const updateData = {};

      if (data.name !== undefined) {
        const name = data.name.trim();
        if (!name) {
          throw new AppError('Barber name cannot be empty', 400);
        }
        updateData.name = name;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = Boolean(data.isActive);
      }

      try {
        return await barberRepository.update(id, updateData);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Barber with id ${id} not found`, 404);
        }
        if (err.code === 'P2002') {
          throw new AppError(`A barber named "${updateData.name}" already exists`, 409);
        }
        throw err;
      }
    },

    async deleteBarber(id) {
      try {
        await barberRepository.remove(id);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Barber with id ${id} not found`, 404);
        }
        if (err.code === 'P2003') {
          throw new AppError('Cannot delete a barber who has existing service records', 409);
        }
        throw err;
      }
    },
  };
}