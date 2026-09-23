import { AppError } from '../utils/appError.js';

export function createServiceRecordService(serviceRecordRepository, barberRepository, serviceRepository) {
  return {
    async getAllRecords() {
      return serviceRecordRepository.findAll();
    },

    async getRecordById(id) {
      const record = await serviceRecordRepository.findById(id);
      if (!record) {
        throw new AppError(`Service record with id ${id} not found`, 404);
      }
      return record;
    },

    async createRecord(data) {
      const barberId = Number(data.barberId);
      const serviceId = Number(data.serviceId);

      if (!Number.isInteger(barberId) || !Number.isInteger(serviceId)) {
        throw new AppError('barberId and serviceId are required and must be integers', 400);
      }

      const barber = await barberRepository.findById(barberId);
      if (!barber) {
        throw new AppError(`Barber with id ${barberId} not found`, 404);
      }

      const service = await serviceRepository.findById(serviceId);
      if (!service) {
        throw new AppError(`Service with id ${serviceId} not found`, 404);
      }

      let amountPaid;
      if (data.amountPaid !== undefined) {
        amountPaid = Number(data.amountPaid);
        if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
          throw new AppError('amountPaid must be a positive number', 400);
        }
      } else {
        amountPaid = service.defaultPrice; // reuse the Decimal Prisma already gave us — no re-parsing, no precision loss
      }

      return serviceRecordRepository.create({ barberId, serviceId, amountPaid });
    },

    async updateRecord(id, data) {
      const updateData = {};

      if (data.amountPaid !== undefined) {
        const amountPaid = Number(data.amountPaid);
        if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
          throw new AppError('amountPaid must be a positive number', 400);
        }
        updateData.amountPaid = amountPaid;
      }

      if (data.barberId !== undefined) {
        const barberId = Number(data.barberId);
        const barber = await barberRepository.findById(barberId);
        if (!barber) {
          throw new AppError(`Barber with id ${barberId} not found`, 404);
        }
        updateData.barberId = barberId;
      }

      if (data.serviceId !== undefined) {
        const serviceId = Number(data.serviceId);
        const service = await serviceRepository.findById(serviceId);
        if (!service) {
          throw new AppError(`Service with id ${serviceId} not found`, 404);
        }
        updateData.serviceId = serviceId;
      }

      try {
        return await serviceRecordRepository.update(id, updateData);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Service record with id ${id} not found`, 404);
        }
        throw err;
      }
    },

    async deleteRecord(id) {
      try {
        await serviceRecordRepository.remove(id);
      } catch (err) {
        if (err.code === 'P2025') {
          throw new AppError(`Service record with id ${id} not found`, 404);
        }
        throw err;
      }
    },
  };
}