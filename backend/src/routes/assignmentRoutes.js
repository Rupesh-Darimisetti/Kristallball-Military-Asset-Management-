import { Router } from 'express';
import {
  createAssignment,
  createExpenditure,
  getAssignments,
  getExpenditures,
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER'), getAssignments);
router.post('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createAssignment);
router.get('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER'), getExpenditures);
router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createExpenditure);

export default router;
