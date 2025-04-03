import crypto from 'crypto';
import querystring from 'qs';
// Hàm kiểm tra URL có phải public không
export const createPaymentLink = async (req, res) => {
    try {
        const { orderId, amount, orderInfo, returnUrl } = req.body;
        const vnp_TmnCode = process.env.VNP_TMN_CODE;
        const vnp_HashSecret = process.env.VNP_HASHSECRET;
        const vnp_Url = process.env.VNP_URL;
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: req.ip,
            vnp_CreateDate: new Date()
                .toISOString()
                .replace(/[-T:.Z]/g, '')
                .slice(0, 14)
        };
        // Tạo chữ ký bảo mật
        const signData = querystring.stringify(vnp_Params, { encode: false });
        if (!vnp_HashSecret) {
            throw new Error('VNP_HASH_SECRET is not defined in the environment variables');
        }
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params.vnp_SecureHash = signed;
        const paymentUrl = `${vnp_Url}?${querystring.stringify(vnp_Params, { encode: false })}`;
        res.json({ paymentUrl });
    }
    catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
// Endpoint xử lý callback từ VNPay
export const handleVnpayCallback = async (req, res) => {
    try {
        const vnp_Params = req.query;
        const vnp_SecureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        // Sort parameters
        const sortedParams = Object.fromEntries(Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b)));
        // Verify secure hash
        const vnp_HashSecret = process.env.VNP_HASHSECRET || '';
        const signData = querystring.stringify(sortedParams, '&', '=', { encodeURIComponent: querystring.unescape });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        if (vnp_SecureHash !== calculatedHash) {
            res.status(400).json({
                success: false,
                message: 'Invalid secure hash'
            });
            return;
        }
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        const orderCode = vnp_Params['vnp_TxnRef'];
        if (vnp_ResponseCode === '00') {
            // Giao dịch thành công, cập nhật trạng thái đơn hàng
            // Gọi API để cập nhật trạng thái đơn hàng (ví dụ: từ PENDING sang SUCCESS)
            // await orderApi.updateOrderStatus(orderCode, 'SUCCESS');
            res.status(200).json({
                success: true,
                message: 'Payment successful',
                data: vnp_Params
            });
        }
        else {
            const errorMessage = VNPAY_ERROR_CODES[vnp_ResponseCode] || 'Payment failed';
            // Cập nhật trạng thái đơn hàng thành FAILED nếu cần
            // await orderApi.updateOrderStatus(orderCode, 'FAILED');
            res.status(400).json({
                success: false,
                message: errorMessage,
                data: vnp_Params
            });
        }
    }
    catch (error) {
        console.error('Error handling VNPay callback:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
//# sourceMappingURL=payment.controllers.js.map