"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.checkAvailableSlots = exports.getOrderById = exports.getAllOrders = exports.getAvailableSlots = exports.createOrderAfterPayment = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_js_1 = __importDefault(require("../models/order.model.js"));
const delivery_model_js_1 = __importDefault(require("../models/delivery.model.js"));
const coupon_model_js_1 = __importDefault(require("../models/coupon.model.js"));
const coupon_enum_js_1 = require("../enums/coupon.enum.js");
const orderdetail_model_js_1 = __importDefault(require("../models/orderdetail.model.js"));
const product_model_js_1 = __importDefault(require("../models/product.model.js"));
const order_enum_js_1 = require("../enums/order.enum.js");
const product_enum_js_1 = require("../enums/product.enum.js");
const service_enum_js_1 = require("../enums/service.enum.js");
const service_model_js_1 = __importDefault(require("../models/service.model.js"));
const booking_enum_js_1 = require("@/enums/booking.enum.js");
const sendBookingEmail_js_1 = __importDefault(require("@/utils/sendBookingEmail.js"));
const sendEmail_js_1 = __importDefault(require("@/utils/sendEmail.js"));
const createOrderAfterPayment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let transactionCommitted = false;
    try {
        const { userID = null, payment_typeID, deliveryID = null, couponID = null, orderdate, total_price, shipping_address = null, orderDetails, paymentOrderCode = null, infoUserGuest = null } = req.body;
        console.log('req.body.orderDetails:', JSON.stringify(orderDetails, null, 2));
        // 1. Validate input data
        if (!total_price || !orderDetails || !Array.isArray(orderDetails)) {
            throw new Error('Missing required fields');
        }
        // Ánh xạ key để đồng nhất
        const normalizedOrderDetails = orderDetails.map((detail) => ({
            productId: detail.productId || detail.productID || null,
            serviceId: detail.serviceId || detail.serviceID || null,
            quantity: detail.quantity,
            product_price: detail.product_price || detail.productPrice,
            booking_date: detail.booking_date || detail.bookingDate,
            petName: detail.petName,
            petType: detail.petType
        }));
        const isBooking = normalizedOrderDetails.every((detail) => detail.serviceId && !detail.productId);
        const isOrder = normalizedOrderDetails.some((detail) => detail.productId);
        console.log('normalizedOrderDetails:', JSON.stringify(normalizedOrderDetails, null, 2));
        console.log('isBooking:', isBooking);
        console.log('isOrder:', isOrder);
        if (isOrder && !deliveryID) {
            throw new Error('Delivery ID is required for product orders');
        }
        // 4. Validate delivery
        let deliveryFee = 0;
        if (isOrder && deliveryID) {
            const delivery = await delivery_model_js_1.default.findById(deliveryID).session(session);
            if (!delivery)
                throw new Error('Delivery method not found');
            deliveryFee = delivery?.delivery_fee || 0;
        }
        // 6. Calculate total_price
        let calculatedTotalPrice = 0;
        const orderDetailsPromises = normalizedOrderDetails.map(async (detail) => {
            const { productId, serviceId, quantity, product_price, booking_date, petName, petType } = detail;
            if (!quantity || !product_price || (!productId && !serviceId)) {
                console.log('Invalid detail:', JSON.stringify(detail, null, 2));
                throw new Error('Invalid order detail data');
            }
            if (productId) {
                const product = await product_model_js_1.default
                    .findOne({ _id: productId, status: product_enum_js_1.ProductStatus.AVAILABLE })
                    .session(session);
                if (!product)
                    throw new Error(`Product not found or not available: ${productId}`);
                if (product.stock < quantity) {
                    throw new Error(`Insufficient stock for product: ${productId}`);
                }
                await product_model_js_1.default.findByIdAndUpdate(productId, { $inc: { stock: -quantity } }, { session });
            }
            if (serviceId) {
                const service = await service_model_js_1.default.findOne({ _id: serviceId, status: service_enum_js_1.ServiceStatus.ACTIVE }).session(session);
                if (!service)
                    throw new Error(`Service not found or not active: ${serviceId}`);
                if (!petName || !petType) {
                    throw new Error('petName and petType are required for service booking');
                }
            }
            const detailTotalPrice = quantity * product_price;
            calculatedTotalPrice += detailTotalPrice;
            const standardizedBookingDate = serviceId && booking_date ? new Date(booking_date) : null;
            if (standardizedBookingDate) {
                standardizedBookingDate.setMinutes(0, 0, 0);
            }
            return {
                productId,
                serviceId,
                quantity,
                product_price,
                total_price: detailTotalPrice,
                booking_date: standardizedBookingDate,
                petName: serviceId ? petName : null,
                petType: serviceId ? petType : null
            };
        });
        const validatedOrderDetails = await Promise.all(orderDetailsPromises);
        const subtotal = calculatedTotalPrice;
        let discount = 0;
        if (couponID) {
            const coupon = await coupon_model_js_1.default.findById(couponID).session(session);
            if (!coupon)
                throw new Error('Coupon not found');
            const currentDate = new Date();
            if (coupon.status !== coupon_enum_js_1.CouponStatus.ACTIVE ||
                currentDate < coupon.start_date ||
                currentDate > coupon.end_date ||
                coupon.used_count >= coupon.usage_limit) {
                throw new Error('Invalid or expired coupon');
            }
            const discountPercentage = coupon.discount_value;
            discount = (subtotal * discountPercentage) / 100;
            await coupon_model_js_1.default.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } }, { session });
        }
        const discountedSubtotal = subtotal - discount;
        const finalTotalPrice = isOrder ? discountedSubtotal + deliveryFee : discountedSubtotal;
        if (Math.abs(finalTotalPrice - total_price) > 1) {
            throw new Error('Total price mismatch');
        }
        console.log(infoUserGuest, 'infoUserGuest');
        // 7. Create and save order
        const order = new order_model_js_1.default({
            userID: userID ? userID : null,
            fullname: infoUserGuest?.fullName || null,
            phone: infoUserGuest?.phone || null,
            payment_typeID,
            deliveryID: isOrder ? deliveryID : null,
            couponID: couponID || null,
            order_date: orderdate ? new Date(orderdate) : new Date(),
            total_price: finalTotalPrice,
            shipping_address,
            paymentOrderCode,
            status: isOrder ? order_enum_js_1.OrderStatus.PENDING : null,
            bookingStatus: isBooking ? booking_enum_js_1.BookingStatus.CONFIRMED : null,
            payment_status: order_enum_js_1.PaymentStatus.PENDING,
            inforUserGuest: infoUserGuest || null
        });
        const savedOrder = await order.save({ session });
        // 8. Create and save order details
        const orderDetailDocs = validatedOrderDetails.map((detail) => {
            return new orderdetail_model_js_1.default({
                orderId: savedOrder._id,
                productId: detail.productId || null,
                serviceId: detail.serviceId || null,
                quantity: detail.quantity,
                product_price: detail.product_price,
                total_price: detail.total_price,
                booking_date: detail.booking_date,
                petName: detail.petName,
                petType: detail.petType
            });
        });
        await Promise.all(orderDetailDocs.map((detail) => detail.save({ session })));
        // 9. Commit transaction
        await session.commitTransaction();
        transactionCommitted = true;
        // 10. Send email confirmation
        let recipientEmail = null;
        if (userID) {
            const user = await mongoose_1.default.model('user').findById(userID); // Sửa từ 'User' thành 'user'
            recipientEmail = user?.email || null;
        }
        else if (infoUserGuest && infoUserGuest.email) {
            recipientEmail = infoUserGuest.email;
        }
        if (recipientEmail) {
            if (isBooking) {
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
                    console.log('Booking email sent to:', recipientEmail);
                }
                catch (emailError) {
                    console.error('Failed to send booking email:', emailError);
                }
            }
            else {
                const subject = 'Xác nhận đơn hàng thành công';
                const text = `Kính gửi ${infoUserGuest?.fullName || 'Khách hàng'},\n\nĐơn hàng của bạn đã được xác nhận:\n${validatedOrderDetails
                    .map((detail) => `- Sản phẩm: ${detail.productId || detail.serviceId} | Số lượng: ${detail.quantity} | Giá: ${detail.product_price}`)
                    .join('\n')}\nTổng tiền: ${finalTotalPrice} VND\n\nTrân trọng,\nPet Heaven`;
                const html = `<p>Kính gửi ${infoUserGuest?.fullName || 'Khách hàng'},</p>
          <p>Đơn hàng của bạn đã được xác nhận:</p>
          <ul>${validatedOrderDetails
                    .map((detail) => `<li>Sản phẩm: ${detail.productId || detail.serviceId} | Số lượng: ${detail.quantity} | Giá: ${detail.product_price}</li>`)
                    .join('')}</ul>
          <p>Tổng tiền: ${finalTotalPrice} VND</p>
          <p>Trân trọng,<br>Pet Heaven</p>`;
                try {
                    await (0, sendEmail_js_1.default)(recipientEmail, subject, text, html);
                    console.log('Order email sent to:', recipientEmail);
                }
                catch (emailError) {
                    console.error('Failed to send order email:', emailError);
                }
            }
        }
        else {
            console.warn('No recipient email found, skipping email notification');
        }
        // 11. Send response
        res.status(201).json({
            success: true,
            message: 'Order and order details created successfully',
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in createOrderAfterPayment:', errorMessage);
        res.status(400).json({
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error.stack : 'Unknown error stack'
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
            const hour = bookingDate.getHours();
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
        const orders = await order_model_js_1.default
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
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await order_model_js_1.default
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
//# sourceMappingURL=order.controllers.js.map