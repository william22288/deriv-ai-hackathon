import { Router } from 'express';
import * as lawController from '../controllers/laws.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', lawController.getAllLaws);
router.get('/:jurisdiction', lawController.getLawsByJurisdiction);
router.get('/:jurisdiction/:category', lawController.getLawsByCategory);

export default router;
