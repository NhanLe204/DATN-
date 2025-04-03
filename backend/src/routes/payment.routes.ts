import { Router, Request, Response } from 'express';
import { createPaymentLink, handleVnpayCallback } from '../controllers/payment.controllers.js';

const paymentRouter = Router();

// Endpoint để tạo link thanh toán VNPay
paymentRouter.post('/create-payment-link', createPaymentLink);

// Endpoint xử lý callback từ VNPay (khi thanh toán thành công hoặc thất bại)
paymentRouter.get('/success', handleVnpayCallback);
paymentRouter.get('/cancel', (req: Request, res: Response) => {
  res.status(200).json({
    success: false,
    message: 'Payment cancelled by user'
  });
});

export default paymentRouter;
