import { Router } from 'express';
import { createTransfer, getTransfers } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), getTransfers);
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);

export default router;
