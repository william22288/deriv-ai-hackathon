import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/sessions', chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:id', chatController.getSession);
router.post('/sessions/:id/messages', chatController.sendMessage);
router.delete('/sessions/:id', chatController.deleteSession);

export default router;
