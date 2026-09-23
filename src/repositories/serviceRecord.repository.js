export function createServiceRecordRepository(prisma) {
  return {
    findAll: () =>
      prisma.serviceRecord.findMany({
        include: { barber: true, service: true },
        orderBy: { createdAt: 'desc' },
      }),

    findById: (id) =>
      prisma.serviceRecord.findUnique({
        where: { id },
        include: { barber: true, service: true },
      }),

    create: (data) =>
      prisma.serviceRecord.create({
        data,
        include: { barber: true, service: true },
      }),

    update: (id, data) =>
      prisma.serviceRecord.update({
        where: { id },
        data,
        include: { barber: true, service: true },
      }),

    remove: (id) => prisma.serviceRecord.delete({ where: { id } }),
  };
}