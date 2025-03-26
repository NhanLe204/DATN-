import { createPaymentLink } from '@/controllers/payment.controllers.js';
import { create } from 'domain';
import { Express, Router, Request, Response } from 'express';

const paymentRouter = Router();

paymentRouter.post('/create-payment-link', createPaymentLink);

export default paymentRouter;
