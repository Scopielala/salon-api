import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { AppError } from '../utils/appError.js';

const DEFAULT_REFRESH_TTL_DAYS = 7;

function getRefreshTtlMs() {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || DEFAULT_REFRESH_TTL_DAYS);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new AppError('REFRESH_TOKEN_TTL_DAYS must be an integer between 1 and 365');
  }
  return days * 24 * 60 * 60 * 1000;
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken() {
  return randomBytes(48).toString('base64url');
}

export function createRefreshTokenService(refreshSessionRepository) {
  function makeSession({ token, familyId, type, subjectId, expiresAt }) {
    return {
      familyId,
      tokenHash: hashToken(token),
      type,
      subjectId,
      expiresAt,
    };
  }

  return {
    async issueToken(type, subjectId) {
      const token = generateToken();
      const session = makeSession({
        token,
        familyId: randomUUID(),
        type,
        subjectId,
        expiresAt: new Date(Date.now() + getRefreshTtlMs()),
      });
      await refreshSessionRepository.create(session);
      return token;
    },

    async rotate(token, expectedType) {
      if (typeof token !== 'string' || token.length < 8) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      const current = await refreshSessionRepository.findByTokenHash(hashToken(token));
      if (!current || current.type !== expectedType) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      if (current.revokedAt) {
        await refreshSessionRepository.revokeFamily(current.familyId);
        throw new AppError('Invalid or expired refresh token', 401);
      }

      if (current.expiresAt <= new Date()) {
        await refreshSessionRepository.revokeFamily(current.familyId);
        throw new AppError('Invalid or expired refresh token', 401);
      }

      const replacementToken = generateToken();
      const replacement = makeSession({
        token: replacementToken,
        familyId: current.familyId,
        type: current.type,
        subjectId: current.subjectId,
        expiresAt: current.expiresAt,
      });
      const rotated = await refreshSessionRepository.rotate(current, replacement);

      if (!rotated) {
        await refreshSessionRepository.revokeFamily(current.familyId);
        throw new AppError('Invalid or expired refresh token', 401);
      }

      return { token: replacementToken, subjectId: current.subjectId };
    },

    async revoke(token, expectedType) {
      if (typeof token !== 'string' || token.length < 8) return;
      await refreshSessionRepository.revokeToken(hashToken(token), expectedType);
    },
  };
}
