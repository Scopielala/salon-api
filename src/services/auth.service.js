import bcrypt from 'bcrypt';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export function createAuthService(staffRepository, refreshTokenService) {
  return {
    async staffLogin(email, password) {
      if (
        typeof email !== 'string' || 
        typeof password !== 'string' || 
        !password
      ) {
        throw new AppError('email and password are required', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();

      const staff = await staffRepository.findByEmail(normalizedEmail);
      if (!staff) {
        throw new AppError('Invalid email or password', 401);
      }

      const isValid = await bcrypt.compare(password, staff.passwordHash);
      if (!isValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = signToken({
        id: staff.id,
        role: staff.role,
        type: 'staff',
      }, process.env.JWT_STAFF_SECRET, 
      process.env.JWT_STAFF_EXPIRES_IN
    );

      const refreshToken = await refreshTokenService.issueToken('staff', staff.id);

      return {
        token,
        refreshToken,
        staff: { 
          id: staff.id, 
          name: staff.name, 
          email: staff.email, 
          role: staff.role 
        },
      };
    },

    async refreshStaff(refreshToken) {
      const refreshed = await refreshTokenService.rotate(refreshToken, 'staff');
      const staff = await staffRepository.findById(refreshed.subjectId);
      if (!staff) {
        await refreshTokenService.revoke(refreshed.token, 'staff');
        throw new AppError('Invalid or expired refresh token', 401);
      }

      return {
        token: signToken({ id: staff.id, role: staff.role, type: 'staff' },
          process.env.JWT_STAFF_SECRET, process.env.JWT_STAFF_EXPIRES_IN),
        refreshToken: refreshed.token,
      };
    },

    logoutStaff(refreshToken) {
      return refreshTokenService.revoke(refreshToken, 'staff');
    },
  };
}
