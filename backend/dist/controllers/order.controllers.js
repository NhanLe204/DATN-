import orderModel from '../models/order.model.js';
import userModel from '../models/user.model.js';
import PaymentType from '../models/paymentType.model.js';
import deliveryModel from '../models/delivery.model.js';
import couponModel from '../models/coupon.model.js';
import { CouponStatus } from '../enums/coupon.enum.js';
export const createOrderAfterPayment = async (req, res) => {
    try {
        const { userID, payment_typeID, deliveryID, couponID, orderdate, total_price, shipping_address, payment_status, transaction_id, booking_date } = req.body;
        // 1. Validate dữ liệu đầu vào
        if (!userID ||
            !payment_typeID ||
            !deliveryID ||
            !total_price ||
            !shipping_address ||
            !payment_status ||
            !transaction_id) {
            res.status(400).json({ success: false, message: 'Thiếu các trường bắt buộc' });
            return;
        }
        // 2. Kiểm tra sự tồn tại của userID
        const user = await userModel.findById(userID);
        if (!user) {
            res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với userID này' });
            return;
        }
        // 3. Kiểm tra sự tồn tại của payment_typeID
        const paymentType = await PaymentType.findById(payment_typeID);
        if (!paymentType) {
            res.status(404).json({ success: false, message: 'Không tìm thấy phương thức thanh toán với payment_typeID này' });
            return;
        }
        // 4. Kiểm tra sự tồn tại của deliveryID và lấy delivery_name
        const delivery = await deliveryModel.findById(deliveryID);
        if (!delivery) {
            res.status(404).json({ success: false, message: 'Không tìm thấy phương thức giao hàng với deliveryID này' });
            return;
        }
        // 5. Kiểm tra sự tồn tại và tính hợp lệ của couponID (nếu có)
        let coupon = null;
        let discount = 0;
        if (couponID) {
            coupon = await couponModel.findById(couponID);
            if (!coupon) {
                res.status(404).json({ success: false, message: 'Không tìm thấy coupon với couponID này' });
                return;
            }
            const currentDate = new Date();
            if (coupon.status !== CouponStatus.ACTIVE ||
                currentDate < coupon.start_date ||
                currentDate > coupon.end_date ||
                coupon.used_count >= coupon.usage_limit) {
                res.status(400).json({ success: false, message: 'Coupon không hợp lệ hoặc đã hết hạn' });
                return;
            }
            discount = Math.min(coupon.discount_value, coupon.max_discount); // Áp dụng giảm giá
        }
        // 7. Tạo Order mới
        const newOrder = new orderModel({
            userID,
            payment_typeID,
            deliveryID,
            couponID: couponID || null,
            orderdate: orderdate ? new Date(orderdate) : new Date(),
            total_price,
            discount,
            shipping_address,
            delivery_name: delivery.delivery_name,
            payment_status,
            transaction_id,
            booking_date: booking_date ? new Date(booking_date) : null
        });
        // 8. Lưu Order vào database
        const savedOrder = await newOrder.save();
        // 9. Cập nhật used_count của Coupon (nếu có)
        if (coupon) {
            await couponModel.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } });
        }
        // 10. Trả về kết quả
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            order: savedOrder
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating order: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find()
            .populate('userID')
            .populate('payment_typeID')
            .populate('deliveryID')
            .populate('couponID');
        res.status(200).json({ success: true, result: orders });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching orders: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
// Ví dụ: getOrderById
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel
            .findById(id)
            .populate('userID')
            .populate('payment_typeID')
            .populate('deliveryID')
            .populate('couponID');
        if (!order) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            return;
        }
        res.status(200).json({ success: true, message: 'Lấy đơn hàng thành công', order });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching order: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
//# sourceMappingURL=order.controllers.js.map