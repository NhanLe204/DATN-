import { Request, Response } from 'express';
import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';
import dotenv from 'dotenv';
import orderModel from '@/models/order.model';
import mongoose from 'mongoose';

dotenv.config();

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const ipAddr = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '';

    const tmnCode = process.env.VNP_TMNCODE as string;
    console.log(tmnCode, 'tmnCode');
    const secretKey = process.env.VNP_HASHSECRET as string;
    console.log('secretKey', secretKey);
    let vnpUrl = process.env.VNP_URL as string;
    console.log('vnpUrl', vnpUrl);
    const returnUrl = process.env.VNP_RETURN_URL as string;
    // Gửi dữ liệu lên VNPAY
    const { orderId, amount, bankCode, language } = req.body;
    console.log('req.body', req.body);
    const locale = language || 'vn';
    const currCode = 'VND';

    let vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh+toan+cho+ma+GD:${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: (amount || 0) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.status(200).json({ success: true, url: vnpUrl });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Hàm sắp xếp object để tạo chữ ký đúng
function sortObject(obj: Record<string, string | number>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys: string[] = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key] as string).replace(/%20/g, '+');
  });
  return sorted;
}
