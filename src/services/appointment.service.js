import { AppError } from '../utils/appError.js';

// Not yet understood

const STAFF_SETTABLE_STATUSES = ['confirmed', 'in_progress', 'cancelled', 'no_show'];

export function createAppointmentService(
  appointmentRepository,
  barberRepository,
  serviceRepository
) {
  return {
    async createAppointment(clientId, data) {
      const barberId = Number(data.barberId);
      if (!Number.isInteger(barberId)) {
        throw new AppError('barberId is required and must be an integer', 400);
      }

      const serviceIds = Array.isArray(data.serviceIds) ? data.serviceIds.map(Number) : [];
      if (serviceIds.length === 0 || serviceIds.some((id) => !Number.isInteger(id))) {
        throw new AppError('serviceIds must be a non-empty array of integers', 400);
      }

      const scheduledAt = new Date(data.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        throw new AppError('scheduledAt must be a valid date', 400);
      }
      if (scheduledAt <= new Date()) {
        throw new AppError('scheduledAt must be in the future', 400);
      }

      const barber = await barberRepository.findById(barberId);
      if (!barber) {
        throw new AppError(`Barber with id ${barberId} not found`, 404);
      }
      if (!barber.isActive) {
        throw new AppError(`Barber with id ${barberId} is not currently active`, 400);
      }

      const services = await serviceRepository.findManyByIds(serviceIds);
      const foundIds = new Set(services.map((s) => s.id));
      const missingIds = serviceIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        throw new AppError(`Service(s) not found: ${missingIds.join(', ')}`, 404);
      }

      const items = services.map((service) => ({
        serviceId: service.id,
        priceAtBooking: service.defaultPrice,
      }));
      const totalPrice = services.reduce(
        (sum, s) => sum.plus ? sum.plus(s.defaultPrice) : Number(sum) + Number(s.defaultPrice),
        0
      );
      const durationMinutes = services.reduce(
        (sum, s) => sum + s.defaultDurationMinutes,
        0
      );

      return appointmentRepository.create({
        clientId,
        barberId,
        scheduledAt,
        durationMinutes,
        totalPrice,
        items,
      });
    },

    async getMyAppointments(clientId) {
      return appointmentRepository.findByClientId(clientId);
    },

    async getAllAppointments() {
      return appointmentRepository.findAll();
    },

    async updateStatus(id, { status, cancellationReason }) {
      if (!STAFF_SETTABLE_STATUSES.includes(status)) {
        throw new AppError(
          `status must be one of: ${STAFF_SETTABLE_STATUSES.join(', ')}`,
          400
        );
      }

      const appointment = await appointmentRepository.findById(id);
      if (!appointment) {
        throw new AppError(`Appointment with id ${id} not found`, 404);
      }
      if (appointment.status === 'completed') {
        throw new AppError('Cannot change the status of a completed appointment', 409);
      }

      const statusData = { status };
      // Only bother recording a cancellation reason/timestamp when we're
      // actually cancelling — no point writing cancelledAt on a confirm.
      if (status === 'cancelled') {
        statusData.cancelledAt = new Date();
        statusData.cancellationReason = cancellationReason?.trim() || null;
      }

      return appointmentRepository.updateStatus(id, statusData);
    },
  };
}