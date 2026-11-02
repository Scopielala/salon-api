export function createClientRepository(prisma) {
  return {
    findByPhone: (phone) => prisma.client.findUnique({ where: { phone } }),
    findById: (id) => prisma.client.findUnique({ where: { id } }),
    findOrCreateByPhone: (phone, name) =>
      prisma.client.upsert({
        where: { phone },
        update: {}, // This was intentionally left empty to avoid updating existing records
        create: { phone, name },
      }),
  };
}