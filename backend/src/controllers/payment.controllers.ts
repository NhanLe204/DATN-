import payos from '../config/payos.config.js';
import { Request, Response } from 'express';
import crypto from 'crypto'; // Để xác minh chữ ký từ PayOS
import orderModel from '../models/order.model.js';

export const createPaymentLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderCode, amount, description, returnUrl, cancelUrl } = req.body;

    if (!orderCode) throw new Error('orderCode is required');
    if (!amount || isNaN(amount) || amount <= 0) throw new Error('amount must be a positive number');
    if (!returnUrl) throw new Error('returnUrl is required');
    if (!cancelUrl) throw new Error('cancelUrl is required');

    const numericOrderCode = Number(orderCode);
    if (isNaN(numericOrderCode)) throw new Error('orderCode must be a number or numeric string');

    const paymentData = {
      orderCode: numericOrderCode,
      amount: Number(amount),
      description: description || `Thanh toán đơn hàng`,
      orderType: 'order',
      currency: 'VND',
      returnUrl,
      cancelUrl
    };

    console.log('Payment data sent to PayOS:', paymentData);
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
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create payment link',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Webhook received:', req.body);
    const webhookData = req.body;
    const { signature, ...dataWithoutSignature } = webhookData; // Loại bỏ signature

    if (!signature) {
      console.log('Missing signature in webhook body');
      res.status(400).json({ success: false, message: 'Missing signature' });
      return;
    }

    const secretKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!secretKey) throw new Error('PAYOS_CHECKSUM_KEY is not defined');

    // Hàm sắp xếp object theo key
    function sortObjDataByKey(object: Record<string, any>): Record<string, any> {
      return Object.keys(object)
        .sort()
        .reduce((obj: Record<string, any>, key: string) => {
          obj[key] = object[key];
          return obj;
        }, {});
    }

    // Hàm chuyển object thành query string theo format PayOS
    function convertObjToQueryStr(object: Record<string, any>): string {
      return Object.keys(object)
        .filter((key) => object[key] !== undefined)
        .map((key) => {
          let value = object[key];

          if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            value = JSON.stringify(sortObjDataByKey(value));
          } else if (Array.isArray(value)) {
            value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
          }

          if ([null, undefined, 'undefined', 'null'].includes(value)) {
            value = '';
          }

          return `${key}=${value}`;
        })
        .join('&');
    }

    const sortedDataByKey = sortObjDataByKey(dataWithoutSignature);
    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);

    const computedSignature = crypto.createHmac('sha256', secretKey).update(dataQueryStr).digest('hex');

    console.log('Computed Signature:', computedSignature);
    console.log('PayOS Signature:', signature);

    if (computedSignature !== signature) {
      console.log('Invalid signature detected');
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const { code, data } = webhookData;
    if (!data || !data.orderCode || !data.status) {
      res.status(400).json({ success: false, message: 'Invalid webhook data' });
      return;
    }

    if (code !== '00') {
      res.status(200).json({ success: true, message: 'Webhook received but payment not successful' });
      return;
    }

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
