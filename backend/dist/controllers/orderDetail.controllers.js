"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOverdueBookings = exports.getOrderById = exports.updateBooking = exports.updateRealPrice = exports.cancelBooking = exports.changeBookingStatus = exports.getOrderByUserId = exports.getAllBookings = exports.getBookingsByUserId = exports.deleteOrderDetail = exports.updateOrderDetail = exports.createOrderDetail = exports.getOrderDetailsByOrderId = exports.getOrderDetails = void 0;
const orderdetail_model_js_1 = __importDefault(require("../models/orderdetail.model.js"));
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const booking_enum_js_1 = require("../enums/booking.enum.js");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const sendBookingEmail_js_1 = __importDefault(require("../utils/sendBookingEmail.js"));
const service_model_js_1 = __importDefault(require("../models/service.model.js"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
// Lấy danh sách tất cả order details
const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await orderdetail_model_js_1.default.find();
        res.status(200).json({ success: true, data: orderDetails });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order details', error });
    }
};
exports.getOrderDetails = getOrderDetails;
// Lấy order details theo orderId
const getOrderDetailsByOrderId = async (req, res) => {
    try {
        const { id } = req.params;
        const orderDetails = await orderdetail_model_js_1.default
            .find({ orderId: id })
            .populate('productId')
            .populate('orderId')
            .populate('serviceId');
        if (!orderDetails.length) {
            res.status(404).json({ success: false, message: 'No order details found for this order' });
            return;
        }
        res.status(200).json({ success: true, data: orderDetails });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order details', error });
    }
};
exports.getOrderDetailsByOrderId = getOrderDetailsByOrderId;
// Tạo order detail mới
const createOrderDetail = async (req, res) => {
    try {
        const { orderId, productId, serviceId, quantity, product_price, total_price, booking_date, isRated } = req.body;
        // Relax validation for bookings
        if (!orderId || (!productId && !serviceId) || !quantity) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        // Validate product_price only for product orders
        if (productId && (!product_price || product_price <= 0)) {
            return res.status(400).json({ success: false, message: 'product_price is required for product orders' });
        }
        // Standardize booking_date to UTC for services
        const standardizedBookingDate = serviceId && booking_date ? moment_timezone_1.default.tz(booking_date, 'Asia/Ho_Chi_Minh').utc().toDate() : null;
        const orderDetail = new orderdetail_model_js_1.default({
            orderId,
            productId: productId || null,
            serviceId: serviceId || null,
            quantity,
            product_price: productId ? product_price : null,
            total_price: productId ? total_price : null,
            booking_date: standardizedBookingDate,
            booking_time: standardizedBookingDate, // Consider separating time if needed
            isRated: isRated || false
        });
        const savedOrderDetail = await orderDetail.save();
        res.status(201).json({ success: true, message: 'Order detail created successfully', data: savedOrderDetail });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order detail', error });
    }
};
exports.createOrderDetail = createOrderDetail;
// Cập nhật order detail theo ID
const updateOrderDetail = async (req, res) => {
    try {
        const updatedOrderDetail = await orderdetail_model_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrderDetail) {
            return res.status(404).json({ success: false, message: 'Order detail not found' });
        }
        res.status(200).json({ success: true, message: 'Order detail updated successfully', data: updatedOrderDetail });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order detail', error });
    }
};
exports.updateOrderDetail = updateOrderDetail;
// Xóa order detail theo ID
const deleteOrderDetail = async (req, res) => {
    try {
        const deletedOrderDetail = await orderdetail_model_js_1.default.findByIdAndDelete(req.params.id);
        if (!deletedOrderDetail) {
            return res.status(404).json({ success: false, message: 'Order detail not found' });
        }
        res.status(200).json({ success: true, message: 'Order detail deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting order detail', error });
    }
};
exports.deleteOrderDetail = deleteOrderDetail;
const getBookingsByUserId = async (req, res, next) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ success: false, message: 'userId is required' });
            return;
        }
        // Bước 1: Kiểm tra xem user có order nào không
        const userOrders = await order_model_js_1.default.find({ userID: userId }).select('_id');
        if (!userOrders.length) {
            res.status(404).json({ success: false, message: 'No orders found for this user' });
            return;
        }
        // Lấy danh sách orderId
        const orderIds = userOrders.map((order) => order._id);
        // Bước 2: Tìm orderDetail có serviceId từ các order của user
        const bookings = await orderdetail_model_js_1.default.aggregate([
            { $match: { orderId: { $in: orderIds }, serviceId: { $ne: null } } },
            { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
            { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } }
        ]);
        console.log('Raw bookings:', bookings);
        if (!bookings.length) {
            res.status(404).json({ success: false, message: 'No bookings found for this user' });
            return;
        }
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving bookings', error });
    }
};
exports.getBookingsByUserId = getBookingsByUserId;
const getAllBookings = async (req, res) => {
    try {
        // Bước 1: Lấy tất cả các order có bookingStatus
        const allOrders = await order_model_js_1.default
            .find({ bookingStatus: { $ne: null } })
            .select('_id')
            .lean();
        if (!allOrders.length) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng nào' });
            return;
        }
        // Lấy danh sách orderId
        const orderIds = allOrders.map((order) => order._id);
        // Bước 2: Tìm orderDetail có serviceId từ tất cả các order
        const bookings = await orderdetail_model_js_1.default.aggregate([
            {
                $match: {
                    orderId: { $in: orderIds },
                    serviceId: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            {
                $unwind: '$order'
            },
            {
                $unwind: '$service'
            },
            {
                $project: {
                    orderId: '$order._id',
                    fullname: {
                        $ifNull: ['$order.fullname', '$order.inforUserGuest.fullName', 'Khách vãng lai']
                    },
                    email: {
                        $ifNull: ['$order.email', '$order.inforUserGuest.email', null]
                    },
                    phone: {
                        $ifNull: ['$order.phone', '$order.inforUserGuest.phone', 'Unknown Phone']
                    },
                    service: {
                        _id: '$service._id',
                        name: '$service.service_name',
                        price: '$service.service_price',
                        duration: '$service.duration'
                    },
                    booking_date: '$booking_date',
                    order_date: '$order.order_date',
                    bookingStatus: '$order.bookingStatus',
                    petName: '$petName',
                    petType: '$petType',
                    petWeight: '$petWeight',
                    realPrice: '$realPrice'
                }
            }
        ]);
        if (!bookings.length) {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch hẹn nào'
            });
            return;
        }
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách lịch hẹn',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};
exports.getAllBookings = getAllBookings;
const getOrderByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ success: false, message: 'Invalid user ID', data: [] });
            return;
        }
        const userOrders = await order_model_js_1.default
            .find({ userID: userId })
            .populate('payment_typeID', 'payment_type_name')
            .populate('deliveryID', 'delivery_fee')
            .populate('couponID', 'discount_value coupon_code');
        if (!userOrders || userOrders.length === 0) {
            res.status(404).json({ success: false, message: 'No orders found for this user', data: [] });
            return;
        }
        const orderIds = userOrders.map((order) => order._id);
        const orderDetails = await orderdetail_model_js_1.default
            .find({
            orderId: { $in: orderIds },
            productId: { $ne: null },
            serviceId: null
        })
            .populate('productId', 'name price image_url')
            .populate('orderId');
        if (!orderDetails || orderDetails.length === 0) {
            res.status(404).json({ success: false, message: 'No product orders found for this user', data: [] });
            return;
        }
        const formattedOrders = userOrders
            .map((order) => {
            const relatedDetails = orderDetails.filter((detail) => detail.orderId._id.toString() === order._id.toString());
            if (relatedDetails.length === 0)
                return null;
            return {
                id: order._id.toString(),
                orderNumber: order.transaction || `${order._id}`,
                date: order.order_date || order.createdAt,
                status: order.status.toUpperCase(),
                payment_status: order.payment_status,
                total: order.total_price || 0,
                items: relatedDetails.map((detail) => ({
                    productId: detail.productId?._id.toString(),
                    orderDetailId: detail._id.toString(),
                    id: detail.productId?._id.toString(),
                    name: detail.productId?.name,
                    quantity: detail.quantity,
                    price: detail.product_price,
                    image_url: detail.productId?.image_url || [],
                    isRated: detail.isRated || false
                })),
                paymentMethod: order.payment_typeID?.payment_type_name,
                shippingAddress: order.shipping_address,
                deliveryFee: order.deliveryID?.delivery_fee,
                discountValue: order.couponID?.discount_value,
                couponCode: order.couponID?.coupon_code
            };
        })
            .filter((order) => order !== null);
        res.status(200).json({ success: true, data: formattedOrders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving orders by user ID', data: [] });
    }
};
exports.getOrderByUserId = getOrderByUserId;
const changeBookingStatus = async (req, res) => {
    try {
        const { orderId, bookingStatus } = req.body;
        // Xác thực đầu vào
        if (!orderId || !bookingStatus) {
            res.status(400).json({
                success: false,
                message: 'orderId và bookingStatus là bắt buộc'
            });
            return;
        }
        // Xác thực trạng thái lịch hẹn
        if (!Object.values(booking_enum_js_1.BookingStatus).includes(bookingStatus)) {
            res.status(400).json({
                success: false,
                message: `Trạng thái lịch hẹn không hợp lệ. Phải là một trong: ${Object.values(booking_enum_js_1.BookingStatus).join(', ')}`
            });
            return;
        }
        // Bắt đầu transaction
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Kiểm tra đơn hàng tồn tại
            const order = await order_model_js_1.default.findById(orderId).session(session);
            if (!order) {
                await session.abortTransaction();
                session.endSession();
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
                return;
            }
            // Kiểm tra đơn hàng có chi tiết dịch vụ không
            const bookingDetail = await orderdetail_model_js_1.default
                .findOne({ orderId: orderId, serviceId: { $ne: null } })
                .session(session);
            if (!bookingDetail) {
                await session.abortTransaction();
                session.endSession();
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy lịch hẹn cho đơn hàng này'
                });
                return;
            }
            // Kiểm tra nếu trạng thái hiện tại là COMPLETED
            if (order.bookingStatus === booking_enum_js_1.BookingStatus.COMPLETED) {
                await session.abortTransaction();
                session.endSession();
                res.status(400).json({
                    success: false,
                    message: 'Không thể thay đổi trạng thái của lịch hẹn đã hoàn thành'
                });
                return;
            }
            // Xác thực chuyển đổi trạng thái
            const validStatusTransitions = {
                [booking_enum_js_1.BookingStatus.PENDING]: [booking_enum_js_1.BookingStatus.CONFIRMED, booking_enum_js_1.BookingStatus.CANCELLED],
                [booking_enum_js_1.BookingStatus.CONFIRMED]: [booking_enum_js_1.BookingStatus.IN_PROGRESS, booking_enum_js_1.BookingStatus.CANCELLED],
                [booking_enum_js_1.BookingStatus.IN_PROGRESS]: [booking_enum_js_1.BookingStatus.COMPLETED],
                [booking_enum_js_1.BookingStatus.COMPLETED]: [],
                [booking_enum_js_1.BookingStatus.CANCELLED]: []
            };
            const currentStatus = order.bookingStatus || booking_enum_js_1.BookingStatus.PENDING;
            if (!validStatusTransitions[currentStatus].includes(bookingStatus)) {
                await session.abortTransaction();
                session.endSession();
                res.status(400).json({
                    success: false,
                    message: `Chuyển đổi trạng thái không hợp lệ từ ${currentStatus} sang ${bookingStatus}`
                });
                return;
            }
            // Cập nhật trạng thái lịch hẹn và trạng thái đơn hàng
            const updateFields = {
                bookingStatus
            };
            switch (bookingStatus) {
                case booking_enum_js_1.BookingStatus.PENDING:
                    updateFields.status = 'pending';
                    break;
                case booking_enum_js_1.BookingStatus.CONFIRMED:
                    updateFields.status = 'confirmed';
                    break;
                case booking_enum_js_1.BookingStatus.IN_PROGRESS:
                    updateFields.status = 'processing';
                    break;
                case booking_enum_js_1.BookingStatus.COMPLETED:
                    updateFields.status = 'completed';
                    break;
                case booking_enum_js_1.BookingStatus.CANCELLED:
                    updateFields.status = 'cancelled';
                    break;
            }
            // Cập nhật đơn hàng
            const updatedOrder = await order_model_js_1.default
                .findByIdAndUpdate(orderId, { $set: updateFields }, { new: true, session })
                .session(session);
            if (!updatedOrder) {
                await session.abortTransaction();
                session.endSession();
                res.status(500).json({
                    success: false,
                    message: 'Không thể cập nhật trạng thái lịch hẹn'
                });
                return;
            }
            // Gửi email khi trạng thái là COMPLETED
            if (bookingStatus === booking_enum_js_1.BookingStatus.COMPLETED) {
                try {
                    const user = await user_model_js_1.default.findById(order.userID).session(session);
                    const orderDetail = await orderdetail_model_js_1.default.findOne({ orderId, serviceId: { $ne: null } }).session(session);
                    const userData = user
                        ? { email: user.email, name: user.fullname }
                        : order.infoUserGuest
                            ? { email: order.infoUserGuest.email, name: order.infoUserGuest.fullName }
                            : null;
                    console.log('User data for email:', userData);
                    console.log('Order detail:', orderDetail);
                    if (userData && userData.email && orderDetail) {
                        const service = await service_model_js_1.default.findById(orderDetail.serviceId).select('service_name');
                        const emailData = {
                            recipientEmail: userData.email,
                            customerName: userData.name,
                            orderDetails: [
                                {
                                    serviceId: orderDetail.serviceId?.toString() || null,
                                    booking_date: orderDetail.booking_date || null,
                                    petName: orderDetail.petName || null,
                                    petType: orderDetail.petType || null
                                }
                            ],
                            orderId: orderId,
                            isCancellation: false
                        };
                        // Gửi email sử dụng sendBookingEmail với nội dung tùy chỉnh
                        await (0, sendBookingEmail_js_1.default)({
                            ...emailData,
                            subject: `Dịch vụ của bạn đã hoàn thành - Mã đơn hàng: ${orderId}`,
                            html: `
                <p>Kính gửi <strong>${userData.name || 'Khách hàng'}</strong>,</p>
                <p>Chúng tôi xin thông báo rằng dịch vụ của bạn đã được hoàn thành thành công!</p>
                <ul>
                  <li><strong>Mã đơn hàng:</strong> ${orderId}</li>
                  <li><strong>Dịch vụ:</strong> ${service?.service_name || 'Không xác định'}</li>
                  <li><strong>Thời gian:</strong> ${orderDetail.booking_date
                                ? new Intl.DateTimeFormat('vi-VN', {
                                    timeZone: 'Asia/Ho_Chi_Minh',
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                }).format(orderDetail.booking_date)
                                : 'N/A'}</li>
                  <li><strong>Thú cưng:</strong> ${orderDetail.petName || 'N/A'} (${orderDetail.petType || 'N/A'})</li>
                  <li><strong>Giá thực tế:</strong> ${orderDetail.realPrice ? orderDetail.realPrice.toLocaleString('vi-VN') + ' VND' : 'N/A'}</li>
                </ul>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
              `
                        });
                        console.log(`Completion email sent to ${userData.email} for order ${orderId}`);
                    }
                    else {
                        console.warn(`No valid email found for order ${orderId}. Skipping email.`);
                    }
                }
                catch (emailError) {
                    console.error('Failed to send completion email:', emailError);
                }
            }
            // Commit transaction
            await session.commitTransaction();
            session.endSession();
            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái lịch hẹn thành công',
                data: {
                    orderId: updatedOrder._id,
                    bookingStatus: updatedOrder.bookingStatus,
                    orderStatus: updatedOrder.status
                }
            });
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    catch (error) {
        console.error('Lỗi khi cập nhật trạng thái lịch hẹn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái lịch hẹn',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};
exports.changeBookingStatus = changeBookingStatus;
const cancelBooking = async (req, res) => {
    try {
        const { orderId, orderDetailId } = req.body;
        // Validate input
        if (!orderId || !orderDetailId) {
            res.status(400).json({
                success: false,
                message: 'orderId and orderDetailId are required'
            });
            return;
        }
        // Check if order exists
        const order = await order_model_js_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        // Check if orderDetail exists
        const orderDetail = await orderdetail_model_js_1.default.findOne({
            _id: orderDetailId,
            orderId,
            serviceId: { $ne: null }
        });
        if (!orderDetail) {
            res.status(404).json({
                success: false,
                message: 'Chi tiết đơn hàng không tồn tại'
            });
            return;
        }
        // ... (phần còn lại của logic)
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error
        });
    }
};
exports.cancelBooking = cancelBooking;
// Bảng giá
const bathData = [
    { weight: '< 5kg', price: 150000 },
    { weight: '5 - 10kg', price: 200000 },
    { weight: '10 - 20kg', price: 250000 },
    { weight: '20 - 40kg', price: 300000 },
    { weight: '> 40kg', price: 350000 }
];
const comboBathData = [
    { weight: '< 5kg', price: 320000 },
    { weight: '5 - 10kg', price: 520000 },
    { weight: '10 - 20kg', price: 620000 },
    { weight: '20 - 40kg', price: 720000 },
    { weight: '> 40kg', price: 820000 }
];
const serviceBathData = [
    { weight: '< 5kg', price: 150000 },
    { weight: '5 - 10kg', price: 180000 },
    { weight: '10 - 20kg', price: 210000 },
    { weight: '20 - 40kg', price: 240000 },
    { weight: '> 40kg', price: 270000 }
];
// Hàm calculatePrice
const calculatePrice = (serviceName, petWeight, petType) => {
    const getWeightRange = (weight) => {
        if (weight < 5)
            return '< 5kg';
        if (weight >= 5 && weight <= 10)
            return '5 - 10kg';
        if (weight > 10 && weight <= 20)
            return '10 - 20kg';
        if (weight > 20 && weight <= 40)
            return '20 - 40kg';
        return '> 40kg';
    };
    const weightRange = getWeightRange(petWeight);
    const normalizedServiceName = serviceName.toLowerCase();
    if (normalizedServiceName.includes('tắm') && !normalizedServiceName.includes('combo')) {
        const priceEntry = bathData.find((item) => item.weight === weightRange);
        return priceEntry ? priceEntry.price : 0;
    }
    else if (normalizedServiceName.includes('combo')) {
        const priceEntry = comboBathData.find((item) => item.weight === weightRange);
        return priceEntry ? priceEntry.price : 0;
    }
    else if (normalizedServiceName.includes('cắt') ||
        normalizedServiceName.includes('tỉa') ||
        normalizedServiceName.includes('cạo')) {
        const priceEntry = serviceBathData.find((item) => item.weight === weightRange);
        return priceEntry ? priceEntry.price : 0;
    }
    return 0;
};
// API updateRealPrice
const updateRealPrice = async (req, res) => {
    try {
        const { orderId, petWeight, petType, serviceName } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!orderId || petWeight == null || !petType || !serviceName) {
            res.status(400).json({
                success: false,
                message: `Yêu cầu đầy đủ các trường: orderId=${orderId}, petWeight=${petWeight}, petType=${petType}, serviceName=${serviceName}`
            });
            return;
        }
        // Kiểm tra petWeight hợp lệ
        if (typeof petWeight !== 'number' || petWeight < 0 || petWeight > 100) {
            res.status(400).json({
                success: false,
                message: `Cân nặng phải là số từ 0 đến 100 kg, nhận được: ${petWeight}`
            });
            return;
        }
        // Tính giá thực tế
        const realPrice = calculatePrice(serviceName, petWeight, petType);
        // Kiểm tra realPrice hợp lệ
        if (realPrice === 0) {
            res.status(400).json({
                success: false,
                message: `Không thể tính giá cho dịch vụ "${serviceName}" với cân nặng ${petWeight} kg`
            });
            return;
        }
        // Cập nhật orderDetail với realPrice
        const updatedOrderDetail = await orderdetail_model_js_1.default.findOneAndUpdate({ orderId, serviceId: { $ne: null } }, { $set: { realPrice } }, { new: true });
        if (!updatedOrderDetail) {
            res.status(404).json({
                success: false,
                message: `Không tìm thấy chi tiết đơn hàng với orderId=${orderId} và serviceId không null`
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật giá thực tế thành công',
            data: {
                orderId,
                realPrice
            }
        });
    }
    catch (error) {
        console.error('Lỗi khi cập nhật giá thực tế:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật giá thực tế'
        });
    }
};
exports.updateRealPrice = updateRealPrice;
// update
const updateBooking = async (req, res) => {
    try {
        const { orderId, bookingDate, serviceId, petName, petType, fullname, bookingStatus } = req.body;
        // Validate orderId
        if (!orderId || typeof orderId !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            console.error('Invalid orderId:', orderId);
            res.status(400).json({
                success: false,
                message: 'orderId không hợp lệ'
            });
            return;
        }
        // Find order and orderDetail
        const order = await order_model_js_1.default.findById(orderId);
        const orderDetail = await orderdetail_model_js_1.default.findOne({ orderId });
        if (!order) {
            console.error('Order not found for orderId:', orderId);
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
            return;
        }
        if (!orderDetail) {
            console.error('OrderDetail not found for orderId:', orderId);
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi tiết đơn hàng'
            });
            return;
        }
        // Prepare update fields
        const updateOrderFields = {};
        const updateOrderDetailFields = {};
        // Handle bookingDate
        if (bookingDate) {
            const parsedBookingDate = (0, dayjs_1.default)(bookingDate, 'YYYY-MM-DD HH:mm:ss', true);
            if (!parsedBookingDate.isValid()) {
                console.error('Invalid bookingDate:', bookingDate);
                res.status(400).json({
                    success: false,
                    message: 'bookingDate phải có định dạng YYYY-MM-DD HH:mm:ss'
                });
                return;
            }
            updateOrderDetailFields.booking_date = parsedBookingDate.tz('Asia/Ho_Chi_Minh').toDate();
            console.log('Setting booking_date to:', updateOrderDetailFields.booking_date);
        }
        // Handle serviceId
        if (serviceId && mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
            updateOrderDetailFields.serviceId = serviceId;
            console.log('Setting serviceId to:', serviceId);
        }
        // Handle petName
        if (petName && typeof petName === 'string' && petName.trim().length > 0) {
            updateOrderDetailFields.petName = petName.trim();
            console.log('Setting petName to:', petName);
        }
        // Handle petType
        if (petType && typeof petType === 'string' && petType.trim().length > 0) {
            updateOrderDetailFields.petType = petType.trim();
            console.log('Setting petType to:', petType);
        }
        // Handle fullname
        if (fullname && typeof fullname === 'string' && fullname.trim().length > 0) {
            updateOrderFields.fullname = fullname.trim();
            console.log('Setting fullname to:', fullname.trim());
        }
        else {
            console.warn('No valid fullname provided for fullname update');
        }
        // Handle bookingStatus
        if (bookingStatus && Object.values(booking_enum_js_1.BookingStatus).includes(bookingStatus)) {
            updateOrderFields.bookingStatus = bookingStatus;
            updateOrderFields.status =
                bookingStatus === booking_enum_js_1.BookingStatus.PENDING
                    ? 'pending'
                    : bookingStatus === booking_enum_js_1.BookingStatus.CONFIRMED
                        ? 'confirmed'
                        : bookingStatus === booking_enum_js_1.BookingStatus.IN_PROGRESS
                            ? 'processing'
                            : bookingStatus === booking_enum_js_1.BookingStatus.COMPLETED
                                ? 'completed'
                                : 'cancelled';
            console.log('Setting bookingStatus to:', bookingStatus);
        }
        // Update order if there are changes
        let updatedOrder = order;
        if (Object.keys(updateOrderFields).length > 0) {
            console.log('Updating order with fields:', updateOrderFields);
            updatedOrder = await order_model_js_1.default.findByIdAndUpdate(orderId, { $set: updateOrderFields }, { new: true });
            if (!updatedOrder) {
                console.error('Failed to update order for orderId:', orderId);
                res.status(500).json({
                    success: false,
                    message: 'Không thể cập nhật đơn hàng'
                });
                return;
            }
            console.log('Updated order:', updatedOrder);
        }
        // Update orderDetail if there are changes
        let updatedOrderDetail = orderDetail;
        if (Object.keys(updateOrderDetailFields).length > 0) {
            console.log('Updating orderDetail with fields:', updateOrderDetailFields);
            updatedOrderDetail = await orderdetail_model_js_1.default.findOneAndUpdate({ orderId }, { $set: updateOrderDetailFields }, { new: true });
            if (!updatedOrderDetail) {
                console.error('Failed to update orderDetail for orderId:', orderId);
                res.status(500).json({
                    success: false,
                    message: 'Không thể cập nhật chi tiết đơn hàng'
                });
                return;
            }
            console.log('Updated orderDetail:', updatedOrderDetail);
        }
        // Return response
        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin booking thành công',
            data: {
                orderId,
                bookingDate: updatedOrderDetail.booking_date,
                serviceId: updatedOrderDetail.serviceId,
                petName: updatedOrderDetail.petName,
                petType: updatedOrderDetail.petType,
                fullname: updatedOrder.fullname, // Sửa từ username
                bookingStatus: updatedOrder.bookingStatus,
                email: updatedOrder.email,
                phone: updatedOrder.phone
            }
        });
    }
    catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật booking',
            error: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
};
exports.updateBooking = updateBooking;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        // Tìm đơn hàng theo ID và populate các trường liên quan
        const order = await order_model_js_1.default
            .findById(id)
            .populate('userID', 'fullname email phone') // Populate userID với các trường cần thiết
            .populate('payment_typeID', 'name') // Populate payment_typeID nếu cần
            .populate('deliveryID', 'name delivery_fee') // Populate deliveryID nếu cần
            .populate('couponID', 'code discount_value') // Populate couponID nếu cần
            .lean();
        if (!order) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            return;
        }
        // Lấy chi tiết đơn hàng liên quan đến orderId
        const orderDetails = await orderdetail_model_js_1.default
            .find({ orderId: id })
            .populate('productId', 'name price image_url') // Populate productId với các trường cần thiết
            .populate('serviceId', 'service_name duration') // Populate serviceId nếu cần
            .lean();
        // Lọc dữ liệu chi tiết đơn hàng
        const filteredOrderDetails = orderDetails.map((detail) => ({
            orderDetailId: detail._id,
            productId: detail.productId?._id || null,
            productName: detail.productId?.name || 'Không xác định',
            productPrice: detail.productId?.price || 0,
            productImage: detail.productId?.image_url?.[0] || null,
            serviceId: detail.serviceId?._id || null,
            serviceName: detail.serviceId?.service_name || 'Không xác định',
            serviceDuration: detail.serviceId?.duration || null,
            quantity: detail.quantity || 0,
            totalPrice: detail.total_price || 0,
            bookingDate: detail.booking_date || null,
            petName: detail.petName || null,
            petType: detail.petType || null
        }));
        res.status(200).json({
            success: true,
            message: 'Lấy đơn hàng thành công',
            data: {
                order,
                orderDetails: filteredOrderDetails
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching order: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.getOrderById = getOrderById;
// Hàm mới: Tự động hủy các đặt lịch quá hạn
const cancelOverdueBookings = () => {
    node_schedule_1.default.scheduleJob('*/1 * * * *', async () => {
        try {
            console.log('Checking for overdue bookings...');
            const now = (0, dayjs_1.default)().tz('Asia/Ho_Chi_Minh');
            // Find bookings with serviceId and booking_date
            const overdueBookings = await orderdetail_model_js_1.default
                .find({
                serviceId: { $ne: null },
                booking_date: { $ne: null }
            })
                .populate('orderId');
            for (const booking of overdueBookings) {
                const order = booking.orderId;
                if (!order || !order.bookingStatus) {
                    console.warn(`Skipping booking with missing order or bookingStatus: ${booking._id}`);
                    continue;
                }
                // Skip if already CANCELLED, IN_PROGRESS, or COMPLETED
                if (order.bookingStatus === booking_enum_js_1.BookingStatus.CANCELLED ||
                    order.bookingStatus === booking_enum_js_1.BookingStatus.IN_PROGRESS ||
                    order.bookingStatus === booking_enum_js_1.BookingStatus.COMPLETED) {
                    continue;
                }
                // Parse booking_date as the full date-time
                const bookingDateTime = (0, dayjs_1.default)(booking.booking_date).tz('Asia/Ho_Chi_Minh');
                if (!bookingDateTime.isValid()) {
                    console.warn(`Invalid booking date for order ${order._id}: ${booking.booking_date}`);
                    continue;
                }
                // Check if more than 15 minutes have passed since the booking time
                const fifteenMinutesAfter = bookingDateTime.add(15, 'minute');
                if (now.isAfter(fifteenMinutesAfter)) {
                    // Update order to CANCELLED
                    await order_model_js_1.default.findByIdAndUpdate(order._id, {
                        $set: {
                            bookingStatus: booking_enum_js_1.BookingStatus.CANCELLED,
                            status: 'cancelled'
                        }
                    }, { new: true });
                    console.log(`Cancelled overdue booking: ${order._id}`);
                }
            }
        }
        catch (error) {
            console.error('Error in cancelOverdueBookings job:', error);
        }
    });
};
exports.cancelOverdueBookings = cancelOverdueBookings;
// Khởi động công việc tự động hủy khi file được load
(0, exports.cancelOverdueBookings)();
//# sourceMappingURL=orderDetail.controllers.js.map