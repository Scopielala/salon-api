import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';

export function requireStaffAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_STAFF_SECRET);
    if (decoded.type !== 'staff') {
      return next(new AppError('Invalid token type for this route', 401));
    }
    req.staff = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireClientAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_CLIENT_SECRET);
    if (decoded.type !== 'client') {
      return next(new AppError('Invalid token type for this route', 401));
    }
    req.client = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.staff) return next(new AppError('Not authenticated', 401));
    if (!allowedRoles.includes(req.staff.role)) {
      return next(new AppError('Not authorized for this action', 403));
    }
    next();
  };
}