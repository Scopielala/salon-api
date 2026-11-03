import { AppError } from '../utils/appError.js';
import prismaPkg from '../generated/prisma/index.js';

// The generated client is CommonJS, so same default-import-then-destructure
const { Prisma } = prismaPkg;

// 'completed' is deliberately missing: it's only reachable through the
// completion flow, so it can never mean anything except "real ServiceRecords exist".
const STAFF_SETTABLE_STATUSES = ['confirmed', 'in_progress', 'cancelled', 'no_show'];

// Single source of truth for "which appointments can be completed". The repository
// receives this list too, so the pre-check and the race guard can't disagree.
const COMPLETABLE_STATUSES = ['confirmed', 'in_progress'];

// Free text from the public internet: cap the length so one request can't store a novel.
const MAX_NOTES_LENGTH = 500;

function assertCompletable(appointment) {
  if (!COMPLETABLE_STATUSES.includes(appointment.status)) {
    throw new AppError(
      `Only ${COMPLETABLE_STATUSES.join(' or ')} appointments can be completed (this one is ${appointment.status})`,
      409
    );
  }
}

// Turns an appointment's booked services into ServiceRecord rows. Default amount
// is the price snapshotted at booking; staff can override per service.
function buildRecords(appointment, adjustments) {
  const overrides = new Map();

  if (adjustments !== undefined) {
    if (!Array.isArray(adjustments)) {
      throw new AppError('adjustments must be an array', 400);
    }
    for (const adj of adjustments) {
      const serviceId = Number(adj?.serviceId);
      const amountPaid = Number(adj?.amountPaid);
      if (!Number.isInteger(serviceId)) {
        throw new AppError('Each adjustment needs an integer serviceId', 400);
      }
      if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
        throw new AppError('Each adjustment needs a positive amountPaid', 400);
      }
      if (overrides.has(serviceId)) {
        throw new AppError(`Duplicate adjustment for service ${serviceId}`, 400);
      }
      overrides.set(serviceId, amountPaid);
    }
  }

  // Reject adjustments for services that were never part of this booking,
  // rather than silently ignoring what is probably a typo.
  const bookedIds = new Set(appointment.services.map((item) => item.serviceId));
  for (const serviceId of overrides.keys()) {
    if (!bookedIds.has(serviceId)) {
      throw new AppError(`Service ${serviceId} is not part of this appointment`, 400);
    }
  }

  return appointment.services.map((item) => ({
    barberId: appointment.barberId,
    serviceId: item.serviceId,
    amountPaid: overrides.get(item.serviceId) ?? item.priceAtBooking,
  }));
}

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

      // serviceIds is an array, so one visit can cover several services.
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

      let notes = null;
      if (data.notes !== undefined && data.notes !== null) {
        if (typeof data.notes !== 'string') {
          throw new AppError('notes must be a string', 400);
        }
        notes = data.notes.trim() || null;
        if (notes && notes.length > MAX_NOTES_LENGTH) {
          throw new AppError(`notes cannot exceed ${MAX_NOTES_LENGTH} characters`, 400);
        }
      }

      const barber = await barberRepository.findById(barberId);
      if (!barber) {
        throw new AppError(`Barber with id ${barberId} not found`, 404);
      }
      if (!barber.isActive) {
        throw new AppError(`Barber with id ${barberId} is not currently active`, 400);
      }

      // One query for all requested services, then check nothing came back missing.
      const services = await serviceRepository.findManyByIds(serviceIds);
      const foundIds = new Set(services.map((s) => s.id));
      const missingIds = serviceIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        throw new AppError(`Service(s) not found: ${missingIds.join(', ')}`, 404);
      }

      // The snapshot step: lock in today's price and duration so later changes
      // to Service can't reach back and alter this appointment.
      const items = services.map((service) => ({
        serviceId: service.id,
        priceAtBooking: service.defaultPrice,
      }));

      // Starting from a real Decimal means .plus() is available from the first
      // iteration, so money never touches floating-point math.
      const totalPrice = services.reduce(
        (sum, s) => sum.plus(s.defaultPrice),
        new Prisma.Decimal(0)
      );
      // Durations are whole minutes, so plain Number math is fine here.
      const durationMinutes = services.reduce((sum, s) => sum + s.defaultDurationMinutes, 0);

      return appointmentRepository.create({
        clientId,
        barberId,
        scheduledAt,
        durationMinutes,
        totalPrice,
        notes,
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
      // Only record a cancellation timestamp/reason when actually cancelling.
      if (status === 'cancelled') {
        statusData.cancelledAt = new Date();
        statusData.cancellationReason = cancellationReason?.trim() || null;
      }

      return appointmentRepository.updateStatus(id, statusData);
    },

    async getCompletionDraft(id) {
      const appointment = await appointmentRepository.findById(id);
      if (!appointment) {
        throw new AppError(`Appointment with id ${id} not found`, 404);
      }
      assertCompletable(appointment);

      // Read-only preview. Nothing is persisted until staff hit "complete".
      return {
        appointmentId: appointment.id,
        barberId: appointment.barberId,
        records: appointment.services.map((item) => ({
          serviceId: item.serviceId,
          serviceName: item.service.name,
          amountPaid: item.priceAtBooking,
        })),
        totalPrice: appointment.totalPrice,
      };
    },

    async completeAppointment(id, data) {
      const appointment = await appointmentRepository.findById(id);
      if (!appointment) {
        throw new AppError(`Appointment with id ${id} not found`, 404);
      }
      assertCompletable(appointment);

      const records = buildRecords(appointment, data?.adjustments);

      const completed = await appointmentRepository.completeWithRecords(
        id,
        COMPLETABLE_STATUSES,
        records
      );

      // null means the status changed between our read and our write (the race
      // the repository guards against).
      if (!completed) {
        throw new AppError(
          'This appointment was just updated by someone else. Please reload and try again.',
          409
        );
      }
      return completed;
    },
  };
}