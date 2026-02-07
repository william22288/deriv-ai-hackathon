import { Router } from 'express';
import * as trainingController from '../controllers/training.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

router.get('/programs', trainingController.getPrograms);
router.get('/programs/:id', trainingController.getProgram);
router.post('/programs', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), trainingController.createProgram);
router.put('/programs/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), trainingController.updateProgram);
router.get('/assignments', trainingController.getAssignments);
router.post('/assignments', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), trainingController.createAssignment);
router.post('/assignments/:id/complete', trainingController.completeAssignment);
router.get('/overdue', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), trainingController.getOverdueTraining);

export default router;
