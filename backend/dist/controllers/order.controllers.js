"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelServiceBooking = exports.updatePaymentStatus = exports.updateOrderStatus = exports.checkAvailableSlots = exports.getOrderById = exports.getAllOrders = exports.getAvailableSlots = exports.createOrderAfterPayment = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const delivery_model_js_1 = __importDefault(require("../models/delivery.model.js"));
const coupon_model_js_1 = __importDefault(require("../models/coupon.model.js"));
const coupon_enum_js_1 = require("../enums/coupon.enum.js");
const orderdetail_model_js_1 = __importDefault(require("../models/orderdetail.model.js"));
const product_model_js_1 = __importDefault(require("../models/product.model.js"));
const order_enum_js_1 = require("../enums/order.enum.js");
const product_enum_js_1 = require("../enums/product.enum.js");
const service_enum_js_1 = require("../enums/service.enum.js");
const service_model_js_1 = __importDefault(require("../models/service.model.js"));
const booking_enum_js_1 = require("../enums/booking.enum.js");
const sendBookingEmail_js_1 = __importDefault(require("../utils/sendBookingEmail.js"));
const sendEmail_js_1 = __importDefault(require("../utils/sendEmail.js"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const createOrderAfterPayment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let transactionCommitted = false;
    try {
        const { userID = null, payment_typeID, deliveryID = null, couponID = null, orderdate, total_price, shipping_address = null, orderDetails, paymentOrderCode = null, infoUserGuest = null } = req.body;
        // Kiểm tra orderDetails
        if (!orderDetails || !Array.isArray(orderDetails)) {
            throw new Error('Thiếu các trường bắt buộc');
        }
        // Chuẩn hóa orderDetails
        const normalizedOrderDetails = orderDetails.map((detail) => ({
            productId: detail.productId || detail.productID || null,
            serviceId: detail.serviceId || detail.serviceID || null,
            quantity: detail.quantity,
            product_price: detail.product_price || detail.productPrice || null,
            booking_date: detail.booking_date || detail.bookingDate,
            petName: detail.petName,
            petType: detail.petType
        }));
        const isBooking = normalizedOrderDetails.every((detail) => detail.serviceId && !detail.productId);
        const isOrder = normalizedOrderDetails.some((detail) => detail.productId);
        // Kiểm tra deliveryID và total_price cho đơn hàng
        if (isOrder && !deliveryID) {
            throw new Error('Yêu cầu Delivery ID cho đơn hàng sản phẩm');
        }
        if (isOrder && !total_price) {
            throw new Error('Yêu cầu tổng giá cho đơn hàng sản phẩm');
        }
        // Tính phí giao hàng
        let deliveryFee = 0;
        if (isOrder && deliveryID) {
            const delivery = await delivery_model_js_1.default.findById(deliveryID).session(session);
            if (!delivery)
                throw new Error('Không tìm thấy phương thức giao hàng');
            deliveryFee = delivery?.delivery_fee || 0;
        }
        // Xử lý orderDetails
        let calculatedTotalPrice = 0;
        const orderDetailsPromises = normalizedOrderDetails.map(async (detail) => {
            const { productId, serviceId, quantity, product_price, booking_date, petName, petType } = detail;
            // Kiểm tra dữ liệu chi tiết
            if (!quantity || (!productId && !serviceId)) {
                const missingFields = [];
                if (!quantity)
                    missingFields.push('quantity');
                if (!productId && !serviceId)
                    missingFields.push('productId hoặc serviceId');
                throw new Error(`Dữ liệu chi tiết đơn hàng không hợp lệ: Thiếu hoặc sai trường - ${missingFields.join(', ')}`);
            }
            if (productId && (!product_price || product_price <= 0)) {
                throw new Error('Yêu cầu product_price và phải lớn hơn 0 cho đơn hàng sản phẩm');
            }
            if (productId) {
                const product = await product_model_js_1.default
                    .findOne({ _id: productId, status: product_enum_js_1.ProductStatus.AVAILABLE })
                    .session(session);
                if (!product)
                    throw new Error(`Không tìm thấy hoặc sản phẩm không khả dụng: ${productId}`);
                if (product.stock < quantity) {
                    throw new Error(`Không đủ hàng cho sản phẩm: ${productId}`);
                }
                await product_model_js_1.default.findByIdAndUpdate(productId, { $inc: { stock: -quantity } }, { session });
            }
            if (serviceId) {
                const service = await service_model_js_1.default.findOne({ _id: serviceId, status: service_enum_js_1.ServiceStatus.ACTIVE }).session(session);
                if (!service)
                    throw new Error(`Không tìm thấy hoặc dịch vụ không hoạt động: ${serviceId}`);
                if (!petName || !petType) {
                    throw new Error('Yêu cầu petName và petType cho đặt dịch vụ');
                }
            }
            let detailTotalPrice = 0;
            if (isOrder) {
                detailTotalPrice = quantity * product_price;
                calculatedTotalPrice += detailTotalPrice;
            }
            // Chuẩn hóa booking_date sang UTC
            const standardizedBookingDate = serviceId && booking_date ? moment_timezone_1.default.tz(booking_date, 'Asia/Ho_Chi_Minh').utc().toDate() : null;
            return {
                productId,
                serviceId,
                quantity,
                product_price: isOrder ? product_price : null,
                total_price: isOrder ? detailTotalPrice : null,
                booking_date: standardizedBookingDate,
                petName: serviceId ? petName : null,
                petType: serviceId ? petType : null
            };
        });
        const validatedOrderDetails = await Promise.all(orderDetailsPromises);
        const subtotal = isOrder ? calculatedTotalPrice : 0;
        // Xử lý giảm giá
        let discount = 0;
        if (isOrder && couponID) {
            const coupon = await coupon_model_js_1.default.findById(couponID).session(session);
            if (!coupon)
                throw new Error('Không tìm thấy mã giảm giá');
            const currentDate = new Date();
            if (coupon.status !== coupon_enum_js_1.CouponStatus.ACTIVE ||
                currentDate < coupon.start_date ||
                currentDate > coupon.end_date ||
                coupon.used_count >= coupon.usage_limit) {
                throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
            }
            const discountPercentage = coupon.discount_value;
            discount = (subtotal * discountPercentage) / 100;
            await coupon_model_js_1.default.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } }, { session });
        }
        const discountedSubtotal = isOrder ? subtotal - discount : 0;
        const finalTotalPrice = isOrder ? discountedSubtotal + deliveryFee : 0;
        // Kiểm tra total_price cho đơn hàng
        if (isOrder && total_price && Math.abs(finalTotalPrice - total_price) > 1) {
            throw new Error('Tổng giá không khớp');
        }
        // Chuẩn hóa order_date sang UTC
        const standardizedOrderDate = orderdate ? moment_timezone_1.default.tz(orderdate, 'Asia/Ho_Chi_Minh').utc().toDate() : new Date();
        // Tạo và lưu đơn hàng
        const order = new order_model_js_1.default({
            userID: userID ? userID : null,
            fullname: infoUserGuest?.fullName || null,
            phone: infoUserGuest?.phone || null,
            email: infoUserGuest?.email || null, // Thêm: Lưu email
            payment_typeID,
            deliveryID: isOrder ? deliveryID : null,
            couponID: couponID || null,
            order_date: standardizedOrderDate,
            total_price: isOrder ? finalTotalPrice : null,
            shipping_address,
            paymentOrderCode,
            status: isOrder ? order_enum_js_1.OrderStatus.PENDING : null,
            bookingStatus: isBooking ? booking_enum_js_1.BookingStatus.CONFIRMED : null,
            payment_status: payment_typeID == '67d67442aeb5082f01074c28' ? order_enum_js_1.PaymentStatus.CASH_ON_DELIVERY : order_enum_js_1.PaymentStatus.PENDING,
            inforUserGuest: infoUserGuest || null // Giữ nguyên để tương thích với logic cũ
        });
        const savedOrder = await order.save({ session });
        // Tạo và lưu chi tiết đơn hàng
        const orderDetailDocs = validatedOrderDetails.map((detail) => {
            return new orderdetail_model_js_1.default({
                orderId: savedOrder._id,
                productId: detail.productId || null,
                serviceId: detail.serviceId || null,
                quantity: detail.quantity,
                product_price: isOrder ? detail.product_price : null,
                total_price: isOrder ? detail.total_price : null,
                booking_date: detail.booking_date,
                petName: detail.petName,
                petType: detail.petType
            });
        });
        await Promise.all(orderDetailDocs.map((detail) => detail.save({ session })));
        // Commit transaction
        await session.commitTransaction();
        transactionCommitted = true;
        // Gửi email xác nhận đặt dịch vụ
        let recipientEmail = null;
        if (userID) {
            const user = await user_model_js_1.default.findById(userID);
            recipientEmail = user?.email || null;
        }
        else if (infoUserGuest && infoUserGuest.email) {
            recipientEmail = infoUserGuest.email;
        }
        if (recipientEmail && isBooking) {
            try {
                await (0, sendBookingEmail_js_1.default)({
                    recipientEmail,
                    orderDetails: validatedOrderDetails.map((detail) => ({
                        serviceId: detail.serviceId,
                        booking_date: detail.booking_date,
                        petName: detail.petName,
                        petType: detail.petType
                    })),
                    orderId: savedOrder._id.toString()
                });
                console.log('Đã gửi email xác nhận đặt dịch vụ đến:', recipientEmail);
            }
            catch (emailError) {
                console.error('Gửi email xác nhận thất bại:', emailError);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng và chi tiết đơn hàng thành công',
            data: {
                order: savedOrder,
                orderDetails: orderDetailDocs
            }
        });
    }
    catch (error) {
        if (!transactionCommitted) {
            await session.abortTransaction();
        }
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        console.error('Lỗi trong createOrderAfterPayment:', errorMessage);
        res.status(400).json({
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error.stack : 'Lỗi không xác định'
        });
    }
    finally {
        session.endSession();
    }
};
exports.createOrderAfterPayment = createOrderAfterPayment;
const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query; // Ngày cần kiểm tra, ví dụ: "2025-03-29"
        console.log(date, 'Đặt lịch');
        if (!date)
            throw new Error('Date is required');
        const maxSlots = 5;
        const availableTimeSlots = ['8h', '9h', '10h', '11h', '13h', '14h', '15h', '16h', '17h'];
        const startOfDay = new Date(`${date}T00:00:00+07:00`);
        const endOfDay = new Date(`${date}T23:59:59.999+07:00`);
        // Lấy tất cả booking trong ngày
        const bookings = await orderdetail_model_js_1.default
            .find({
            booking_date: { $gte: startOfDay, $lte: endOfDay }
        })
            .populate('serviceId');
        // Tính số slot bị chiếm cho từng khung giờ
        const slotOccupancy = {};
        availableTimeSlots.forEach((time) => (slotOccupancy[time] = 0));
        bookings.forEach((booking) => {
            const bookingDate = new Date(booking.booking_date);
            console.log(bookingDate, 'bookingDate');
            const hour = bookingDate.getHours();
            console.log(hour, 'HOUR');
            const serviceDuration = booking.serviceId?.duration || 60;
            const affectedSlots = Math.ceil(serviceDuration / 60);
            for (let i = 0; i < affectedSlots; i++) {
                const slotHour = hour + i;
                const time = `${slotHour}h`;
                if (availableTimeSlots.includes(time)) {
                    slotOccupancy[time] += 1;
                }
            }
        });
        // Tính slot còn lại
        const slotAvailability = {};
        availableTimeSlots.forEach((time) => {
            slotAvailability[time] = maxSlots - slotOccupancy[time];
        });
        res.status(200).json({
            success: true,
            data: slotAvailability
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAvailableSlots = getAvailableSlots;
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderdetail_model_js_1.default
            .find({ productId: { $ne: null }, serviceId: null })
            .populate({
            path: 'orderId', // Populate orderId
            populate: {
                path: 'userID', // Nested populate userID từ orderId
                select: 'fullname email phone avatar' // Chỉ lấy các trường cần thiết
            }
        })
            .populate('productId', 'name price')
            .lean();
        res.status(200).json({ success: true, result: orders });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching orders: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
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
        res.status(200).json({ success: true, message: 'Lấy đơn hàng thành công', order });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching order: ${errorMessage}`);
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
exports.getOrderById = getOrderById;
const checkAvailableSlots = async (req, res) => {
    const { date, time } = req.query;
    const maxSlots = 5;
    try {
        // Kiểm tra đầu vào
        if (!date || !time || typeof date !== 'string' || typeof time !== 'string') {
            res.status(400).json({ message: 'Invalid date or time parameters' });
            return;
        }
        // Chuyển time từ dạng "9h" sang số giờ (9)
        const hourMatch = time.match(/^(\d+)h$/);
        if (!hourMatch) {
            res.status(400).json({ message: 'Invalid time format. Expected format: "Xh" (e.g., "9h")' });
            return;
        }
        const hour = parseInt(hourMatch[1], 10);
        // Kiểm tra giờ hợp lệ (từ 0 đến 23)
        if (isNaN(hour) || hour < 0 || hour > 23) {
            res.status(400).json({ message: 'Invalid hour value' });
            return;
        }
        // Tạo khoảng thời gian theo giờ Việt Nam (UTC+07:00)
        const startDate = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00+07:00`);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);
        // Kiểm tra xem startDate có hợp lệ không
        if (isNaN(startDate.getTime())) {
            res.status(400).json({ message: 'Invalid date format. Expected format: "YYYY-MM-DD"' });
            return;
        }
        // Đếm số lượng pet đã đặt trong khung giờ
        const bookedPets = await orderdetail_model_js_1.default.countDocuments({
            booking_date: {
                $gte: startDate,
                $lt: endDate
            }
        });
        // Tính số slot còn lại
        const remainingSlots = maxSlots - bookedPets;
        // Trả về kết quả
        res.status(200).json({
            date,
            time,
            remainingSlots: remainingSlots >= 0 ? remainingSlots : 0
        });
    }
    catch (error) {
        console.error('Error checking slots:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.checkAvailableSlots = checkAvailableSlots;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log('status', status);
        // Kiểm tra xem ID có hợp lệ không
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
            return;
        }
        // Kiểm tra xem trạng thái có hợp lệ không
        if (!Object.values(order_enum_js_1.OrderStatus).includes(status)) {
            res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
            return;
        }
        // Cập nhật trạng thái đơn hàng
        const updatedOrder = await order_model_js_1.default.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!updatedOrder) {
            res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Trạng thái đơn hàng được cập nhật thành công', order: updatedOrder });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating order status: ${error.message}`);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        else {
            console.error('Lỗi không xác định khi cập nhật trạng thái đơn hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};
exports.updateOrderStatus = updateOrderStatus;
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        // Kiểm tra xem ID có hợp lệ không
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
            return;
        }
        // Kiểm tra xem trạng thái thanh toán có hợp lệ không
        if (!Object.values(order_enum_js_1.PaymentStatus).includes(payment_status)) {
            res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
            return;
        }
        // Cập nhật trạng thái thanh toán
        const updatedOrder = await order_model_js_1.default.findByIdAndUpdate(id, { payment_status }, { new: true, runValidators: true });
        if (!updatedOrder) {
            res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            return;
        }
        res
            .status(200)
            .json({ success: true, message: 'Trạng thái thanh toán được cập nhật thành công', order: updatedOrder });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating payment status: ${error.message}`);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
        else {
            console.error('Lỗi không xác định khi cập nhật trạng thái thanh toán:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
const cancelServiceBooking = async (req, res) => {
    try {
        const { orderId, orderDetailId } = req.body;
        // 1. Kiểm tra đầu vào
        if (!orderId || !mongoose_1.default.Types.ObjectId.isValid(orderId)) {
            res.status(400).json({ success: false, message: 'Order ID không hợp lệ' });
            return;
        }
        if (!orderDetailId || !mongoose_1.default.Types.ObjectId.isValid(orderDetailId)) {
            res.status(400).json({ success: false, message: 'Order Detail ID không hợp lệ' });
            return;
        }
        // 2. Tìm order
        const order = await order_model_js_1.default.findById(orderId);
        if (!order) {
            res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            return;
        }
        // 3. Tìm orderDetail
        const orderDetail = await orderdetail_model_js_1.default
            .findOne({ _id: orderDetailId, orderId })
            .populate('serviceId')
            .populate('productId');
        if (!orderDetail) {
            res.status(404).json({ success: false, message: 'Chi tiết đơn hàng không tồn tại' });
            return;
        }
        // 4. Kiểm tra điều kiện hủy (chỉ cho dịch vụ)
        if (!orderDetail.serviceId) {
            res.status(400).json({ success: false, message: 'Hàm này chỉ dùng để hủy đặt lịch dịch vụ' });
            return;
        }
        if (order.bookingStatus !== booking_enum_js_1.BookingStatus.CONFIRMED) {
            res.status(400).json({ success: false, message: 'Chỉ có thể hủy ở trạng thái CONFIRMED' });
            return;
        }
        const bookingDate = orderDetail.booking_date;
        if (!bookingDate) {
            res.status(400).json({ success: false, message: 'Không tìm thấy thời gian booking' });
            return;
        }
        const currentTime = new Date();
        const bookingDateObj = new Date(bookingDate);
        const timeDifferenceInHours = (bookingDateObj.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        const cancelDeadlineHours = 12;
        if (timeDifferenceInHours < cancelDeadlineHours) {
            res.status(400).json({
                success: false,
                message: `Không thể hủy booking trước ${cancelDeadlineHours} tiếng`
            });
            return;
        }
        // 5. Cập nhật trạng thái
        order.bookingStatus = booking_enum_js_1.BookingStatus.CANCELLED;
        await order.save();
        console.log('Order updated with status:', order.bookingStatus);
        // 6. Gửi email thông báo hủy dịch vụ
        let recipientEmail = null;
        let customerName = 'Khách hàng';
        if (order.userID) {
            const user = await user_model_js_1.default.findById(order.userID);
            recipientEmail = user?.email || null;
            customerName = user?.fullname || 'Khách hàng';
        }
        else if (order.inforUserGuest?.email) {
            recipientEmail = order.inforUserGuest.email;
            customerName = order.inforUserGuest.fullName || 'Khách hàng';
        }
        if (recipientEmail) {
            // Định dạng ngày giờ theo kiểu Việt Nam
            const formatDateTime = (date) => {
                return new Intl.DateTimeFormat('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Ho_Chi_Minh'
                }).format(date);
            };
            // Định dạng giá tiền
            const formatPrice = (price) => {
                return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
            };
            // Thông tin dịch vụ
            const serviceName = orderDetail.serviceId?.service_name || 'Không xác định';
            const servicePrice = orderDetail.serviceId?.service_price || 0; // Giả sử có trường service_price
            const duration = orderDetail.serviceId?.duration || 60; // Giả sử có trường duration
            const petName = orderDetail.petName || 'Không xác định';
            const petType = orderDetail.petType || 'Không xác định';
            const bookingTime = formatDateTime(bookingDateObj);
            const orderIdString = order._id.toString();
            // Nội dung email
            const subject = 'Thông báo hủy lịch đặt dịch vụ';
            const text = `Kính gửi ${customerName},\n\nLịch đặt dịch vụ của bạn đã được hủy thành công! Dưới đây là thông tin chi tiết về lịch hẹn đã hủy:\n\nDịch vụ: ${serviceName}\nThời gian: ${bookingTime}\nThú cưng: ${petName} (${petType})\\nThời gian dự kiến: ${duration} phút\nĐịa điểm: 123 Nguyen Van Cu, District 1, HCM City\nMã đặt lịch: ${orderIdString}\n\nNếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline 19006336 hoặc email ngocthanhnt04@gmail.com.\n\nTrân trọng,\nPet Heaven`;
            const html = `
        <p>Kính gửi <strong>${customerName}</strong>,</p>
        <p>Lịch đặt dịch vụ của bạn đã được hủy thành công! Dưới đây là thông tin chi tiết về lịch hẹn đã hủy:</p>
        <ul>
          <li><strong>Dịch vụ:</strong> ${serviceName}</li>
          <li><strong>Thời gian:</strong> ${bookingTime}</li>
          <li><strong>Thú cưng:</strong> ${petName} (${petType})</li>
          <li><strong>Giá dự tính:</strong> ${formatPrice(servicePrice)}</li>
          <li><strong>Thời gian dự kiến:</strong> ${duration} phút</li>
          <li><strong>Địa điểm:</strong> 123 Nguyen Van Cu, District 1, HCM City</li>
          <li><strong>Mã đặt lịch:</strong> ${orderIdString}</li>
        </ul>
        <p>Nếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline <strong>19006336</strong> hoặc email <strong>ngocthanhnt04@gmail.com</strong>.</p>
        <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
      `;
            try {
                await (0, sendEmail_js_1.default)(recipientEmail, subject, text, html);
                console.log('Cancellation email sent to:', recipientEmail);
            }
            catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }
        }
        else {
            console.warn('No recipient email found, skipping email notification');
        }
        // 7. Trả về phản hồi
        res.status(200).json({
            success: true,
            message: 'Hủy đặt lịch dịch vụ thành công',
            data: {
                orderId: order._id,
                orderDetailId: orderDetail._id,
                bookingStatus: order.bookingStatus,
                status: order.status
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in cancelServiceBooking:', errorMessage);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi hủy đặt lịch dịch vụ',
            details: errorMessage
        });
    }
};
exports.cancelServiceBooking = cancelServiceBooking;
//# sourceMappingURL=order.controllers.js.map