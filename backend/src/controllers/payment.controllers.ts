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
    // Log toàn bộ headers để kiểm tra
    console.log('All Headers:', req.headers);

    // Lấy dữ liệu webhook
    const webhookData = req.body;
    console.log('Webhook received:', webhookData);

    // Lấy signature từ body thay vì headers
    const signature = webhookData.signature;
    if (!signature) {
      console.log('Missing signature in body');
      res.status(400).json({ success: false, message: 'Missing signature' });
      return;
    }

    // Đọc secret key từ env
    const secretKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!secretKey) {
      throw new Error('PAYOS_CHECKSUM_KEY is not defined');
    }

    // Tính toán chữ ký từ raw body
    const rawBody = JSON.stringify(webhookData);
    const computedSignature = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');

    // So sánh chữ ký
    if (computedSignature !== signature) {
      console.log('Invalid signature:', signature);
      console.log('Computed signature:', computedSignature);
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    // Kiểm tra dữ liệu webhook
    const { code, data } = webhookData;
    if (!data || !data.orderCode || !data.status) {
      res.status(400).json({ success: false, message: 'Invalid webhook data: missing required fields' });
      return;
    }

    if (code !== '00') {
      res.status(200).json({ success: true, message: 'Webhook received but payment not successful' });
      return;
    }

    // Ánh xạ trạng thái từ PayOS
    const mapPaymentStatus = (payosStatus: string) => {
      switch (payosStatus) {
        case 'PAID':
          return 'COMPLETED';
        case 'CANCELLED':
          return 'CANCELLED';
        default:
          return 'PENDING';
      }
    };
    const newStatus = mapPaymentStatus(data.status);

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await orderModel.findOneAndUpdate(
      { transaction_id: `TRANS_${data.orderCode}` },
      { status: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    console.log(`Order ${data.orderCode} updated to status: ${newStatus}`);
    res.status(200).json({ success: true, message: 'Webhook processed successfully', data: updatedOrder });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrderByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await payos.getPaymentLinkInformation(req.params.orderId);
    if (!order) {
      res.json({
        error: -1,
        message: 'failed',
        data: null
      });
    }
    res.json({
      error: 0,
      message: 'ok',
      data: order
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: -1,
      message: 'failed',
      data: null
    });
    return;
  }
};
