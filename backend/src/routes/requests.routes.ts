import { Router } from 'express';
import * as requestController from '../controllers/requests.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequest);
router.patch('/:id', requestController.updateRequest);
router.post('/:id/assign', authorize(ROLES.HR_ADMIN, ROLES.MANAGER), requestController.assignRequest);
router.post('/:id/approve', authorize(ROLES.HR_ADMIN, ROLES.MANAGER), requestController.approveRequest);
router.post('/:id/reject', authorize(ROLES.HR_ADMIN, ROLES.MANAGER), requestController.rejectRequest);

export default router;
