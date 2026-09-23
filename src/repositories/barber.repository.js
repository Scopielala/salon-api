export function createBarberRepository(prisma) {
  return {
    findAll: () => prisma.barber.findMany({ orderBy: { name: 'asc' } }),
    findById: (id) => prisma.barber.findUnique({ where: { id } }),
    create: (data) => prisma.barber.create({ data }),
    update: (id, data) => prisma.barber.update({ where: { id }, data }),
    remove: (id) => prisma.barber.delete({ where: { id } }),
  };
}