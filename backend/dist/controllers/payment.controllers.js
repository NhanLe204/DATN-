"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vnpayCallBack = exports.createPayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const qs_1 = __importDefault(require("qs"));
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = __importDefault(require("dotenv"));
const order_model_1 = __importDefault(require("@/models/order.model"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const createPayment = async (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = (0, moment_1.default)(date).format('YYYYMMDDHHmmss');
        const ipAddr = Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '';
        const tmnCode = process.env.VNP_TMNCODE;
        console.log(tmnCode, 'tmnCode');
        const secretKey = process.env.VNP_HASHSECRET;
        console.log('secretKey', secretKey);
        let vnpUrl = process.env.VNP_URL;
        console.log('vnpUrl', vnpUrl);
        const returnUrl = process.env.VNP_RETURN_URL;
        // Gửi dữ liệu lên VNPAY
        const { orderId, amount, bankCode, language } = req.body;
        console.log('req.body', req.body);
        const locale = language || 'vn';
        const currCode = 'VND';
        let vnp_Params = {
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
        const signData = qs_1.default.stringify(vnp_Params, { encode: false });
        const hmac = crypto_1.default.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs_1.default.stringify(vnp_Params, { encode: false });
        res.status(200).json({ success: true, url: vnpUrl });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.createPayment = createPayment;
const vnpayCallBack = async (req, res) => {
    const vnp_Params = req.query;
    const vnp_SecureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;
    const orderId = vnp_Params.vnp_TxnRef;
    console.log('orderId', orderId);
    if (!mongoose_1.default.Types.ObjectId.isValid(orderId)) {
        res.status(400).json({ message: 'Invalid order ID' });
        return;
    }
    const secretKey = process.env.VNP_HASHSECRET;
    const sortedParams = sortObject(vnp_Params);
    const signData = qs_1.default.stringify(sortedParams, { encode: false });
    const checkHash = crypto_1.default.createHmac('sha512', secretKey).update(signData, 'utf-8').digest('hex');
    if (checkHash !== vnp_SecureHash) {
        return res.redirect(`${process.env.CLIENT_RETURN_FAIL}?orderId=${orderId}&error=invalid-signature`);
    }
    if (vnp_Params.vnp_TransactionStatus === '00') {
        await order_model_1.default.findByIdAndUpdate(orderId, { payment_status: 'PAID' });
        return res.redirect(`${process.env.CLIENT_RETURN_SUCCESS}?orderId=${orderId}`);
    }
    else {
        await order_model_1.default.findByIdAndUpdate(orderId, { payment_status: 'FAILED' });
        return res.redirect(`${process.env.CLIENT_RETURN_FAIL}?orderId=${orderId}`);
    }
};
exports.vnpayCallBack = vnpayCallBack;
// Hàm sắp xếp object để tạo chữ ký đúng
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
}
//# sourceMappingURL=payment.controllers.js.map