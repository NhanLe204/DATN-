import { createPaymentLink, getOrderByOrderId, handlePaymentWebhook } from '../controllers/payment.controllers.js';
import { Router } from 'express';
const paymentRouter = Router();
paymentRouter.post('/create-payment-link', createPaymentLink);
paymentRouter.get('/info/:orderCode', getOrderByOrderId);
paymentRouter.post('/webhook', handlePaymentWebhook);
paymentRouter.get('/webhook', (req, res) => {
    res.send('Webhook endpoint is active. Use POST to send webhook data from PayOS.');
});
export default paymentRouter;
//# sourceMappingURL=payment.routes.js.map