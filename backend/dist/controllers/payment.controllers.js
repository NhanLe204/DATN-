import payos from '../config/payos.config.js';
export const createPaymentLink = async (req, res) => {
    try {
        const paymentData = {
            orderCode: Date.now(), // Mã đơn hàng duy nhất
            amount: 2000, // Số tiền (VNĐ)
            description: 'Thanh toán đơn hàng',
            returnUrl: 'success.html', // Thay bằng URL thực tế
            cancelUrl: 'cancel.html' // Thay bằng URL thực tế
        };
        const paymentLink = await payos.createPaymentLink(paymentData);
        res.status(200).json(paymentLink);
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating rate: ${error.message}`);
        }
        else {
            console.error('Error updating rate:', error);
        }
        res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};
//# sourceMappingURL=payment.controllers.js.map