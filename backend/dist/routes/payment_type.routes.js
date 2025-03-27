import { Router } from 'express';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const paymentType = Router();
paymentType.get('/payments', getAllPayments);
paymentType.get('/payments/:id', getPaymentById);
paymentType.post('/payments', verifyToken, requireAdmin, insertPayment);
paymentType.patch('/payments/:id', verifyToken, requireAdmin, updatePayment);
paymentType.delete('/payments/:id', verifyToken, requireAdmin, deletePayents);
export default paymentType;
//# sourceMappingURL=payment_type.routes.js.map