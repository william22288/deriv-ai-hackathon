import { Router } from 'express';
import * as documentController from '../controllers/documents.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/auth.js';

const router = Router();

router.use(authenticate);

// Document Generation
router.post('/generate', documentController.generateDocument);
router.get('/list', documentController.listDocuments);

// Compliance
router.get('/compliance', documentController.getComplianceItems);
router.post('/compliance', documentController.addComplianceItem);
router.put('/compliance/:id', documentController.updateComplianceItem);
router.delete('/compliance/:id', documentController.deleteComplianceItem);
router.get('/compliance/analytics', documentController.getComplianceAnalytics);

// Templates
router.get('/templates', documentController.getTemplates);
router.get('/templates/:id', documentController.getTemplate);
router.post('/templates', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), documentController.createTemplate);
router.put('/templates/:id', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), documentController.updateTemplate);

// Contracts
router.post('/contracts/generate', documentController.generateContract);
router.get('/contracts', documentController.getContracts);
router.get('/contracts/:id', documentController.getContract);
router.get('/contracts/:id/versions', documentController.getContractVersions);
router.get('/contracts/:id/download', documentController.downloadContract);
router.post('/contracts/:id/sign', documentController.signContract);

// Equity
router.post('/equity/generate', authorize(ROLES.HR_ADMIN, ROLES.SUPER_ADMIN), documentController.generateEquityDocs);
router.get('/equity/:employeeId', documentController.getEmployeeEquity);

export default router;
