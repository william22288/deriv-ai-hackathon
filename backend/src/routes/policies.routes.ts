import { Router } from 'express';
import * as policyController from '../controllers/policies.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', policyController.getPolicies);
router.get('/:id', policyController.getPolicy);
router.post('/', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), policyController.createPolicy);
router.put('/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), policyController.updatePolicy);
router.post('/search', policyController.searchPolicies);

export default router;
