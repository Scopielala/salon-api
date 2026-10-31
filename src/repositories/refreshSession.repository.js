export function createRefreshSessionRepository(prisma) {
  return {
    create(data) {
      return prisma.refreshSession.create({ data });
    },

    findByTokenHash(tokenHash) {
      return prisma.refreshSession.findUnique({ where: { tokenHash } });
    },

    async rotate(currentSession, replacement) {
      return prisma.$transaction(async (tx) => {
        const claimed = await tx.refreshSession.updateMany({
          where: { id: currentSession.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        if (claimed.count !== 1) return false;

        await tx.refreshSession.create({ data: replacement });
        return true;
      });
    },

    revokeFamily(familyId) {
      return prisma.refreshSession.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },

    revokeToken(tokenHash, type) {
      return prisma.refreshSession.updateMany({
        where: { tokenHash, type, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },
  };
}
