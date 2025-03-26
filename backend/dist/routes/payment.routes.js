import { createPaymentLink } from '@/controllers/payment.controllers.js';
import { Router } from 'express';
const paymentRouter = Router();
paymentRouter.post('/create-payment-link', createPaymentLink);
export default paymentRouter;
//# sourceMappingURL=payment.routes.js.map