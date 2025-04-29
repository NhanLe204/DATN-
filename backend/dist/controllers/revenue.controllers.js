"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenue = void 0;
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const booking_enum_js_1 = require("../enums/booking.enum.js");
const orderdetail_model_js_1 = __importDefault(require("@/models/orderdetail.model.js"));
const getRevenue = async (req, res) => {
    try {
        const { type = 'daily', from, to } = req.query;
        // Định dạng ngày cho group
        const groupFormat = type === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
        // Điều kiện lọc cho order
        const matchOrder = {
            payment_status: { $in: ['PAID', 'CASH_ON_DELIVERY'] }
        };
        if (from && to) {
            matchOrder.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        // 1. Lấy doanh thu bán hàng từ orderModel
        const orders = await order_model_js_1.default.find(matchOrder).lean(); // .lean() để trả về plain JS object, tăng hiệu suất
        const orderRevenueMap = {};
        // Nhóm và tính tổng doanh thu bán hàng
        for (const order of orders) {
            const date = formatDate(order.createdAt, groupFormat);
            orderRevenueMap[date] = (orderRevenueMap[date] || 0) + order.total_price;
        }
        // 2. Lấy doanh thu dịch vụ spa từ orderDetailModel
        const matchOrderDetail = {};
        if (from && to) {
            matchOrderDetail.updatedAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        const orderDetails = await orderdetail_model_js_1.default
            .find(matchOrderDetail)
            .populate({
            path: 'orderId',
            match: { bookingStatus: booking_enum_js_1.BookingStatus.COMPLETED }
        })
            .lean();
        const bookingRevenueMap = {};
        // Nhóm và tính tổng doanh thu dịch vụ
        for (const detail of orderDetails) {
            if (!detail.orderId)
                continue; // Bỏ qua nếu không có order khớp
            const date = formatDate(detail.updatedAt, groupFormat);
            bookingRevenueMap[date] = (bookingRevenueMap[date] || 0) + detail.realPrice;
        }
        // 3. Merge kết quả
        const merged = mergeRevenue(orderRevenueMap, bookingRevenueMap);
        res.json({ success: true, data: merged });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
        return;
    }
};
exports.getRevenue = getRevenue;
// Hàm định dạng ngày
const formatDate = (date, format) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (format === '%Y-%m') {
        return `${year}-${month}`;
    }
    return `${year}-${month}-${day}`;
};
// Hàm ghép dữ liệu order + booking
const mergeRevenue = (orderRevenueMap, bookingRevenueMap) => {
    const map = {};
    // Thêm doanh thu bán hàng
    for (const date in orderRevenueMap) {
        map[date] = { salesRevenue: orderRevenueMap[date], serviceRevenue: 0 };
    }
    // Thêm doanh thu dịch vụ
    for (const date in bookingRevenueMap) {
        if (map[date]) {
            map[date].serviceRevenue = bookingRevenueMap[date];
        }
        else {
            map[date] = { salesRevenue: 0, serviceRevenue: bookingRevenueMap[date] };
        }
    }
    // Chuyển thành mảng và tính tổng
    const result = Object.keys(map)
        .map((date) => {
        const sales = map[date].salesRevenue;
        const service = map[date].serviceRevenue;
        return {
            date,
            salesRevenue: sales,
            serviceRevenue: service,
            totalRevenue: sales + service
        };
    })
        .sort((a, b) => a.date.localeCompare(b.date)); // Sắp xếp theo ngày
    return result;
};
//# sourceMappingURL=revenue.controllers.js.map