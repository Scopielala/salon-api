export function createServiceRepository(prisma) {
  return {
    findAll: () => prisma.service.findMany({ orderBy: { name: 'asc' } }),
    findById: (id) => prisma.service.findUnique({ where: { id } }),
    findManyByIds: (ids) => prisma.service.findmany({where: { id:{ in: ids  }}}),
    create: (data) => prisma.service.create({ data }),
    update: (id, data) => prisma.service.update({ where: { id }, data }),
    remove: (id) => prisma.service.delete({ where: { id } }),
  };
}