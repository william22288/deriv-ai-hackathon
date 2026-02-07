import { Router } from 'express';
import * as complianceController from '../controllers/compliance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

router.get('/items', complianceController.getComplianceItems);
router.get('/items/:id', complianceController.getComplianceItem);
router.post('/items', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), complianceController.createComplianceItem);
router.put('/items/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), complianceController.updateComplianceItem);
router.get('/expiring', complianceController.getExpiringItems);
router.get('/dashboard', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), complianceController.getDashboard);
router.post('/reports/generate', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), complianceController.generateReport);

export default router;
