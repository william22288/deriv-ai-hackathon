import { Router } from 'express';
import * as employeeController from '../controllers/employees.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), employeeController.createEmployee);
router.put('/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), employeeController.updateEmployee);
router.get('/:id/team', employeeController.getTeam);

export default router;
