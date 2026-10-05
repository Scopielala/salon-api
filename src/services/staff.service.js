import bcrypt from 'bcrypt';
import { AppError } from '../utils/appError.js';

const SALT_ROUNDS = 10;

export function createStaffService(staffRepository) {
  return {
    async createStaff(data) {
      const name = data.name?.trim();
      const email = data.email?.trim().toLowerCase();
      const password = data.password;
      const role = data.role === 'admin' ? 'admin' : 'staff';

      if (!name || !email || !password) {
        throw new AppError('name, email, and password are required', 400);
      }
      if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      try {
        const staff = await staffRepository.create({ name, email, passwordHash, role });
        return sanitize(staff);
      } catch (err) {
        if (err.code === 'P2002') {
          throw new AppError(`A staff account with email "${email}" already exists`, 409);
        }
        throw err;
      }
    },

    async listStaff() {
      const staffList = await staffRepository.findAll();
      return staffList.map(sanitize);
    },
  };
}

function sanitize({ passwordHash, ...safe }) {
  return safe;
}