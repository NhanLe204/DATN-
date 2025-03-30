import { createPaymentLink, handlePaymentWebhook } from '@/controllers/payment.controllers.js';
import { create } from 'domain';
import { Express, Router, Request, Response } from 'express';

const paymentRouter = Router();

paymentRouter.post('/create-payment-link', createPaymentLink);
paymentRouter.post('/webhook', handlePaymentWebhook);
paymentRouter.get('/webhook', (req, res) => {
  res.send('Webhook endpoint is active. Use POST to send webhook data from PayOS.');
});
export default paymentRouter;
