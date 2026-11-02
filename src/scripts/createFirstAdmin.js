import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node src/scripts/createFirstAdmin.js "Full Name" email@example.com password123');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const admin = await prisma.staff.upsert({
  where: { email },
  update: {},
  create: { name, email, passwordHash, role: 'admin' },
});

console.log('Admin ready:', { id: admin.id, email: admin.email, role: admin.role });
process.exit(0);