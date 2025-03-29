import { createPaymentLink, handlePaymentWebhook } from '';
import { Router } from 'express';
const paymentRouter = Router();
paymentRouter.post('/create-payment-link', createPaymentLink);
paymentRouter.post('/webhook', handlePaymentWebhook);
paymentRouter.get('/webhook', (req, res) => {
  res.send('Webhook endpoint is active. Use POST to send webhook data from PayOS.');
});
export default paymentRouter;
//# sourceMappingURL=payment.routes.js.map
