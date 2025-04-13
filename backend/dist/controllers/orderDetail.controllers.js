"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCancelledBookings = exports.changeBookingStatus = exports.getOrderByUserId = exports.getAllBookings = exports.getBookingsByUserId = exports.deleteOrderDetail = exports.updateOrderDetail = exports.createOrderDetail = exports.getOrderDetailsByOrderId = exports.getOrderDetails = void 0;
const orderdetail_model_js_1 = __importDefault(require("../models/orderdetail.model.js"));
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const booking_enum_js_1 = require("../enums/booking.enum.js");
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
        const { orderId, productId, serviceId, quantity, product_price, total_price, booking_date } = req.body;
        if (!orderId || (!productId && !serviceId) || !quantity || !product_price) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const orderDetail = new orderdetail_model_js_1.default({
            orderId,
            productId: productId || null,
            serviceId: serviceId || null,
            quantity,
            product_price,
            total_price,
            booking_date: serviceId ? booking_date : null,
            booking_time: serviceId ? booking_date : null
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
        console.log('User orders:', userOrders);
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
const getAllBookings = async (req, res, next) => {
    try {
        // Bước 1: Lấy tất cả các order
        const allOrders = await order_model_js_1.default.find().select('_id');
        if (!allOrders.length) {
            res.status(404).json({ success: false, message: 'No orders found' });
            return;
        }
        // Lấy danh sách orderId
        const orderIds = allOrders.map((order) => order._id);
        console.log(orderIds, 'orderIds');
        // Bước 2: Tìm orderDetail có serviceId từ tất cả các order
        const bookings = await orderdetail_model_js_1.default.aggregate([
            { $match: { orderId: { $in: orderIds }, serviceId: { $ne: null } } },
            { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
            { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
            { $lookup: { from: 'users', localField: 'order.userID', foreignField: '_id', as: 'user' } },
            { $unwind: '$order' },
            { $unwind: '$service' },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // Cho phép user null
            {
                $project: {
                    orderId: '$order._id',
                    user: {
                        name: {
                            $ifNull: ['$user.fullname', '$order.fullname'] // Kiểm tra user.fullname, nếu null thì lấy fullName từ order
                        },
                        email: '$user.email',
                        phone: {
                            $ifNull: ['$user.phone_number', '$order.phone'] // Kiểm tra user.phone, nếu null thì lấy phone từ order
                        }
                    },
                    service: {
                        name: '$service.service_name',
                        price: '$service.service_price',
                        duration: '$service.duration'
                    },
                    booking_date: 1, // Từ orderDetail
                    order_date: '$order.order_date', // Từ orderModel
                    status: '$order.status',
                    bookingStatus: '$order.bookingStatus',
                    petName: 1, // Thêm petName từ orderDetail
                    petType: 1 // Thêm petType từ orderDetail
                }
            }
        ]);
        if (!bookings.length) {
            res.status(404).json({ success: false, message: 'No bookings found' });
            return;
        }
        res.status(200).json({ success: true, data: bookings });
    }
    catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).json({ success: false, message: 'Error retrieving bookings', error });
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
                    image_url: detail.productId?.image_url || []
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
        // Validate input
        if (!orderId || !bookingStatus) {
            res.status(400).json({
                success: false,
                message: 'orderId and bookingStatus are required'
            });
            return;
        }
        // Validate bookingStatus
        if (!Object.values(booking_enum_js_1.BookingStatus).includes(bookingStatus)) {
            res.status(400).json({
                success: false,
                message: `Invalid booking status. Must be one of: ${Object.values(booking_enum_js_1.BookingStatus).join(', ')}`
            });
            return;
        }
        // Check if order exists and has booking (service)
        const order = await order_model_js_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        // Check if this order has any booking (service) details
        const bookingDetail = await orderdetail_model_js_1.default.findOne({
            orderId: orderId,
            serviceId: { $ne: null }
        });
        if (!bookingDetail) {
            res.status(404).json({
                success: false,
                message: 'No booking found for this order'
            });
            return;
        }
        // Update booking status
        const updatedOrder = await order_model_js_1.default.findByIdAndUpdate(orderId, { bookingStatus: bookingStatus }, { new: true });
        if (!updatedOrder) {
            res.status(500).json({
                success: false,
                message: 'Failed to update booking status'
            });
            return;
        }
        // Optionally, you might want to update related order status based on booking status
        let newOrderStatus = updatedOrder.status;
        switch (bookingStatus) {
            case booking_enum_js_1.BookingStatus.PENDING:
                newOrderStatus = 'pending';
                break;
            case booking_enum_js_1.BookingStatus.CONFIRMED:
                newOrderStatus = 'confirmed';
                break;
            case booking_enum_js_1.BookingStatus.IN_PROGRESS:
                newOrderStatus = 'processing';
                break;
            case booking_enum_js_1.BookingStatus.COMPLETED:
                newOrderStatus = 'completed';
                break;
            case booking_enum_js_1.BookingStatus.CANCELLED:
                newOrderStatus = 'cancelled';
                break;
        }
        // Update order status if needed
        if (newOrderStatus !== updatedOrder.status) {
            await order_model_js_1.default.findByIdAndUpdate(orderId, { status: newOrderStatus }, { new: true });
        }
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: {
                orderId: updatedOrder._id,
                bookingStatus: updatedOrder.bookingStatus,
                orderStatus: newOrderStatus
            }
        });
    }
    catch (error) {
        console.error('Error changing booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error
        });
    }
};
exports.changeBookingStatus = changeBookingStatus;
const getCancelledBookings = async (req, res) => {
    try {
        // Lấy tất cả các order có bookingStatus là CANCELLED
        const cancelledOrders = await order_model_js_1.default
            .find({
            bookingStatus: booking_enum_js_1.BookingStatus.CANCELLED
        })
            .select('_id');
        if (!cancelledOrders.length) {
            res.status(404).json({
                success: false,
                message: `Không tìm thấy booking nào có trạng thái ${booking_enum_js_1.BookingStatus.CANCELLED}`
            });
            return;
        }
        // Lấy danh sách orderId
        const orderIds = cancelledOrders.map((order) => order._id);
        // Tìm các orderDetail liên quan đến các booking đã hủy
        const cancelledBookings = await orderdetail_model_js_1.default.aggregate([
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
                $lookup: {
                    from: 'users',
                    localField: 'order.userID',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$order' },
            { $unwind: '$service' },
            { $unwind: '$user' },
            {
                $project: {
                    orderId: '$order._id',
                    user: {
                        name: '$user.fullname',
                        email: '$user.email'
                    },
                    service: {
                        name: '$service.service_name',
                        price: '$service.service_price',
                        duration: '$service.duration'
                    },
                    booking_date: 1,
                    order_date: '$order.order_date',
                    status: '$order.status',
                    bookingStatus: '$order.bookingStatus',
                    petName: 1,
                    petType: 1
                }
            }
        ]);
        if (!cancelledBookings.length) {
            res.status(404).json({
                success: false,
                message: 'No cancelled bookings found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: cancelledBookings
        });
    }
    catch (error) {
        console.error('Error retrieving cancelled bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cancelled bookings',
            error
        });
    }
};
exports.getCancelledBookings = getCancelledBookings;
//# sourceMappingURL=orderDetail.controllers.js.map