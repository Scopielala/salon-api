export function createAppointmentRepository(prisma) {
  const include = {
    client: true,
    barber: true,
    services: { include: { service: true } },
  };

  return {
    findAll: () => prisma.appointment.findMany({ include, orderBy: { scheduledAt: 'asc' } }),
    findById: (id) => prisma.appointment.findUnique({ where: { id }, include }),
    findByClientId: (clientId) =>
      prisma.appointment.findMany({ where: { clientId }, include, orderBy: { scheduledAt: 'asc' } }),
    create: ({ clientId, barberId, scheduledAt, durationMinutes, totalPrice, items }) =>
      prisma.appointment.create({
        data: {
          clientId,
          barberId,
          scheduledAt,
          durationMinutes,
          totalPrice,
          services: { create: items },
        },
        include,
      }),

    updateStatus: (id, statusData) =>
      prisma.appointment.update({ where: { id }, data: statusData, include }),
  };
}