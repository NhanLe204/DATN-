import { Router } from 'express';
import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';

const paymentRouter = Router();

paymentRouter.post('/create-payment', (req, res) => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const orderId = moment(date).format('DDHHmmss');

  const config = {
    tmnCode: '0GUYR2H6',
    secretKey: 'P219F6LYZM4IFIA3G0PGBCUUANOD9QAT',
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'http://localhost:3000/order/vnpay_return'
  };

  const { amount, bankCode, language: locale = 'vn' } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan cho ma GD:${orderId}`,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });

  let signed;
  try {
    const hmac = crypto.createHmac('sha512', config.secretKey);
    signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  } catch (error) {
    console.error('Error generating hash:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  const finalParams = { ...sortedParams, vnp_SecureHash: signed };

  const paymentUrl = `${config.vnpUrl}?${querystring.stringify(finalParams, { encode: true })}`;

  console.log('[DEBUG] Final payment URL:', paymentUrl);

  return res.status(200).json({ url: paymentUrl });
});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

export default paymentRouter;
