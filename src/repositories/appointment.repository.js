export function createAppointmentRepository(prisma) {
  const include = {
    client: true,
    barber: true,
    services: { include: { service: true } },
    serviceRecords: true, //empty until the appointment is completed
  };

  return {
    findAll: () => prisma.appointment.findMany({ include, orderBy: { scheduledAt: 'asc' } }),
    findById: (id) => prisma.appointment.findUnique({ where: { id }, include }),
    findByClientId: (clientId) =>
      prisma.appointment.findMany({ where: { clientId }, include, orderBy: { scheduledAt: 'asc' } }),
    create: ({ clientId, barberId, scheduledAt, durationMinutes, totalPrice, notes, items }) =>
      prisma.appointment.create({
        data: {
          clientId,
          barberId,
          scheduledAt,
          durationMinutes,
          totalPrice,
          notes,
          services: { create: items },
        },
        include,
      }),

    updateStatus: (id, statusData) =>
      prisma.appointment.update({ where: { id }, data: statusData, include }),

    // The status write and the ServiceRecord inserts must succeed or fail
    // together: a "completed" appointment with no records (or records on a
    // still-confirmed appointment) would quietly corrupt the revenue history.
    // The service layer passes in which statuses are allowed, so that rule lives in one place.
    completeWithRecords: (id, allowedStatuses, records) =>
      prisma.$transaction(async (tx) => {
    // The status check is part of the UPDATE itself. If two staff members
    // click "complete" at the same moment, only one update matches (the second
    // sees status = completed) and the other gets count 0, so we never
    // double-create records.
      const { count } = await tx.appointment.updateMany({
        where: { id, status: { in: allowedStatuses } },
        data: { status: 'completed', completedAt: new Date() },
      });
      if (count === 0) return null; // nothing changed, nothing was written

      await tx.serviceRecord.createMany({
        data: records.map((record) => ({ ...record, appointmentId: id })),
      });

      return tx.appointment.findUnique({ where: { id }, include });
    }),
  };
}