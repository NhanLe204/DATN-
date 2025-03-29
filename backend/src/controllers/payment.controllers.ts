import payos from '../config/payos.config.js';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import orderDetailModel from '../models/orderdetail.model.js';
import crypto from 'crypto'; // Để xác minh chữ ký từ PayOS
import orderModel from '../models/order.model.js';

export const createPaymentLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderCode, amount, description, returnUrl, cancelUrl } = req.body;
    // Validate required fields
    if (!orderCode) {
      throw new Error('orderCode is required');
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('amount must be a positive number');
    }
    if (!returnUrl) {
      throw new Error('returnUrl is required');
    }
    if (!cancelUrl) {
      throw new Error('cancelUrl is required');
    }

    // Convert orderCode to number (PayOS requirement)
    const numericOrderCode = Number(orderCode);
    if (isNaN(numericOrderCode)) {
      throw new Error('orderCode must be a number or numeric string');
    }

    // Prepare payment data for PayOS
    const paymentData = {
      orderCode: numericOrderCode,
      amount: Number(amount),
      description: description || `Thanh toan don hang`,
      orderType: 'order', // Có thể tùy chỉnh nếu cần
      currency: 'VND',
      returnUrl,
      cancelUrl
    };
    console.log('Description:', paymentData.description);
    console.log('Payment data sent to PayOS:', paymentData);

    // Create payment link with PayOS
    const paymentLink = await payos.createPaymentLink(paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment link created successfully',
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: paymentLink.orderCode
      }
    });
  } catch (error) {
    console.error('Error creating payment link:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link';
    const errorResponse = {
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    };

    res.status(500).json(errorResponse);
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookData = req.body;

    // 1. Xác minh chữ ký từ PayOS (nếu có)
    const signature = req.headers['x-payos_checksum'] as string; // PayOS gửi chữ ký trong header
    const secretKey = process.env.PAYOS_CHECKSUM_KEY; // Secret key từ PayOS dashboard
    const rawBody = JSON.stringify(webhookData);
    if (!secretKey) {
      throw new Error('PAYOS_CHECKSUM_KEY is not defined');
    }
    const computedSignature = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');

    if (computedSignature !== signature) {
      res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
      return;
    }

    // 2. Xử lý dữ liệu từ webhook
    const { code, data } = webhookData;
    if (code !== '00') {
      // "00" là mã thành công của PayOS
      res.status(200).json({
        success: true,
        message: 'Webhook received but payment not successful'
      });
      return;
    }

    const { orderCode, status } = data;

    // 3. Cập nhật trạng thái đơn hàng
    let newStatus;
    switch (status) {
      case 'PAID':
        newStatus = 'COMPLETED';
        break;
      case 'CANCELLED':
        newStatus = 'CANCELLED';
        break;
      default:
        newStatus = 'PENDING'; // Hoặc xử lý trạng thái khác nếu cần
    }

    const updatedOrder = await orderModel.findOneAndUpdate(
      { transaction_id: `TRANS_${orderCode}` }, // Tìm đơn hàng bằng transaction_id
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // 4. Trả về phản hồi thành công cho PayOS
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};
