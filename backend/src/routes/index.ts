import { Router } from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employees.routes.js';
import documentRoutes from './documents.routes.js';
import chatRoutes from './chat.routes.js';
import policyRoutes from './policies.routes.js';
import lawRoutes from './laws.routes.js';
import requestRoutes from './requests.routes.js';
import complianceRoutes from './compliance.routes.js';
import trainingRoutes from './training.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/policies', policyRoutes);
router.use('/laws', lawRoutes);
router.use('/requests', requestRoutes);
router.use('/compliance', complianceRoutes);
router.use('/training', trainingRoutes);

export default router;
