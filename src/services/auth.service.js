import bcrypt from 'bcrypt';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export function createAuthService(staffRepository) {
  return {
    async staffLogin(email, password) {
      if (!email || !password) {
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

      return {
        token,
        staff: { 
          id: staff.id, 
          name: staff.name, 
          email: staff.email, 
          role: staff.role 
        },
      };
    },
  };
}