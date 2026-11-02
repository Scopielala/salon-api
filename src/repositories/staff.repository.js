export function createStaffRepository(prisma) {
  return {
    findByEmail: (email) => prisma.staff.findUnique({ where: { email } }),
    findById: (id) => prisma.staff.findUnique({ where: { id } }),
    findAll: () => prisma.staff.findMany({ orderBy: { name: 'asc' } }),
    create: (data) => prisma.staff.create({ data }),
  };
}