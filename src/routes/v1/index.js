import { Router } from 'express';
import { createBarberRouter } from '../barber.routes.js';
import { createServiceRouter } from '../service.routes.js';
import { createServiceRecordRouter } from '../serviceRecord.routes.js';
import { createAuthRouter } from '../auth.routes.js';
import { createStaffRouter } from '../staff.routes.js';
import { requireStaffAuth, requireRole, requireClientAuth } from '../../middleware/auth.middleware.js';
import { createClientRouter } from '../client.routes.js';
import { createAppointmentRouter } from '../appointment.routes.js';
import { createPublicAppointmentRouter } from '../publicAppointment.routes.js';

export function createV1Router({ barberController, serviceController, serviceRecordController, authController, staffController, clientController, appointmentController }) {
  const router = Router();

  // Public - no token needed to log in
  router.use('/auth', createAuthRouter(authController));
  router.use('/barbers', requireStaffAuth, createBarberRouter(barberController));
  router.use('/services', requireStaffAuth, createServiceRouter(serviceController));
  router.use('/service-records', requireStaffAuth, createServiceRecordRouter(serviceRecordController));
  // Protected - admin only, for the whole resource
  router.use('/staff', requireStaffAuth, requireRole('admin'), createStaffRouter(staffController));
  // Client routes
  router.use('/public/clients', createClientRouter(clientController));
  // Staff-Appointment routes
  router.use('/appointments', requireStaffAuth, createAppointmentRouter(appointmentController));
  // Client-Appointment routes
  router.use('/public/appointments', requireClientAuth, createPublicAppointmentRouter(appointmentController));
  
  return router;
}