import prisma from './config/prisma.js';

import { createBarberRepository } from './repositories/barber.repository.js';
import { createBarberService } from './services/barber.service.js';
import { createBarberController } from './controllers/barber.controller.js';

import { createServiceRepository } from './repositories/service.repository.js';
import { createServiceService } from './services/service.service.js';
import { createServiceController } from './controllers/service.controller.js';

import { createServiceRecordRepository } from './repositories/serviceRecord.repository.js';
import { createServiceRecordService } from './services/serviceRecord.service.js';
import { createServiceRecordController } from './controllers/serviceRecord.controller.js';

import { createStaffRepository } from './repositories/staff.repository.js';
import { createStaffService } from './services/staff.service.js';
import { createStaffController } from './controllers/staff.controller.js';
import { createAuthService } from './services/auth.service.js';
import { createAuthController } from './controllers/auth.controller.js';

import { createClientRepository } from './repositories/client.repository.js';
import { createClientService } from './services/client.service.js';
import { createClientController } from './controllers/client.controller.js';

import { createAppointmentRepository } from './repositories/appointment.repository.js';
import { createAppointmentService } from './services/appointment.service.js';
import { createAppointmentController } from './controllers/appointment.controller.js';


const barberRepository = createBarberRepository(prisma);
const barberService = createBarberService(barberRepository);
const barberController = createBarberController(barberService);

const serviceRepository = createServiceRepository(prisma);
const serviceService = createServiceService(serviceRepository);
const serviceController = createServiceController(serviceService);

const serviceRecordRepository = createServiceRecordRepository(prisma);
const serviceRecordService = createServiceRecordService(
  serviceRecordRepository,
  barberRepository,
  serviceRepository
);
const serviceRecordController = createServiceRecordController(serviceRecordService);

const staffRepository = createStaffRepository(prisma);
const staffService = createStaffService(staffRepository);
const staffController = createStaffController(staffService);

const authService = createAuthService(staffRepository);
const authController = createAuthController(authService);

const clientRepository = createClientRepository(prisma);
const clientService = createClientService(clientRepository);
const clientController = createClientController(clientService);

const appointmentRepository = createAppointmentRepository(prisma);
const appointmentService = createAppointmentService(appointmentRepository);
const appointmentController = createAppointmentController(appointmentService);``

export const container = {
  barberController,
  serviceController,
  serviceRecordController,
  staffController,
  authController,
  clientController,
  appointmentController,
};