import mongoose from 'mongoose';
import orderModel from '../models/order.model.js';
import userModel from '../models/user.model.js';
import PaymentType from '../models/paymentType.model.js';
import deliveryModel from '../models/delivery.model.js';
import couponModel from '../models/coupon.model.js';
import { CouponStatus } from '../enums/coupon.enum.js';
import orderDetailModel from '../models/orderdetail.model.js';
import productModel from '../models/product.model.js';
import { OrderStatus, PaymentStatus } from '../enums/order.enum.js';
import { ProductStatus } from '../enums/product.enum.js';
import { ServiceStatus } from '../enums/service.enum.js';
import serviceModel from '../models/service.model.js';
export const createOrderAfterPayment = async (req, res) => {
    // Start a MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userID, payment_typeID, deliveryID, couponID, orderdate, total_price, shipping_address, payment_status, transaction_id, booking_date, orderDetails } = req.body;
        // 1. Validate input data
        if (!userID ||
            !payment_typeID ||
            !deliveryID ||
            !total_price ||
            !shipping_address ||
            !payment_status ||
            !transaction_id ||
            !orderDetails ||
            !Array.isArray(orderDetails)) {
            throw new Error('Missing required fields');
        }
        // Validate payment_status
        if (!Object.values(PaymentStatus).includes(payment_status)) {
            throw new Error('Invalid payment status');
        }
        // 2. Validate user existence
        const user = await userModel.findById(userID).session(session);
        if (!user)
            throw new Error('User not found');
        // 3. Validate payment type
        const paymentType = await PaymentType.findById(payment_typeID).session(session);
        if (!paymentType)
            throw new Error('Payment type not found');
        // 4. Validate delivery
        const delivery = await deliveryModel.findById(deliveryID).session(session);
        if (!delivery)
            throw new Error('Delivery method not found');
        // 5. Handle coupon validation and discount calculation
        let discount = 0;
        if (couponID) {
            const coupon = await couponModel.findById(couponID).session(session);
            if (!coupon)
                throw new Error('Coupon not found');
            const currentDate = new Date();
            if (coupon.status !== CouponStatus.ACTIVE ||
                currentDate < coupon.start_date ||
                currentDate > coupon.end_date ||
                coupon.used_count >= coupon.usage_limit) {
                throw new Error('Invalid or expired coupon');
            }
            discount = Math.min(coupon.discount_value, coupon.max_discount);
            // Update coupon usage
            await couponModel.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } }, { session });
        }
        // 6. Calculate total_price (verify total_price from client)
        let calculatedTotalPrice = 0;
        const orderDetailsPromises = orderDetails.map(async (detail) => {
            const { productID, serviceID, quantity, product_price } = detail;
            if (!quantity || !product_price || (!productID && !serviceID)) {
                throw new Error('Invalid order detail data');
            }
            // Validate product if exists
            if (productID) {
                const product = await productModel
                    .findOne({ _id: productID, status: ProductStatus.AVAILABLE })
                    .session(session);
                if (!product)
                    throw new Error(`Product not found or not available: ${productID}`);
                // Check product stock
                if (product.stock < quantity) {
                    throw new Error(`Insufficient stock for product: ${productID}`);
                }
                // Update product stock
                await productModel.findByIdAndUpdate(productID, { $inc: { stock: -quantity } }, { session });
            }
            // Validate service if exists
            if (serviceID) {
                const service = await serviceModel.findOne({ _id: serviceID, status: ServiceStatus.ACTIVE }).session(session);
                if (!service)
                    throw new Error(`Service not found or not active: ${serviceID}`);
            }
            // Calculate total price for this detail
            const detailTotalPrice = quantity * product_price;
            calculatedTotalPrice += detailTotalPrice;
            return { productID, serviceID, quantity, product_price, total_price: detailTotalPrice };
        });
        // Wait for all validations and calculations
        const validatedOrderDetails = await Promise.all(orderDetailsPromises);
        // Verify total_price
        const finalTotalPrice = calculatedTotalPrice - discount;
        if (Math.abs(finalTotalPrice - total_price) > 1) {
            throw new Error('Total price mismatch');
        }
        // 7. Create and save order
        const order = new orderModel({
            userID,
            payment_typeID,
            deliveryID,
            couponID: couponID || null,
            orderdate: orderdate ? new Date(orderdate) : new Date(),
            total_price: finalTotalPrice,
            discount,
            shipping_address,
            delivery_name: delivery.delivery_name,
            payment_status, // Lấy từ body (pending)
            status: OrderStatus.PENDING,
            transaction_id,
            booking_date: booking_date ? new Date(booking_date) : null
        });
        const savedOrder = await order.save({ session });
        // 8. Create and save order details
        const orderDetailDocs = validatedOrderDetails.map((detail) => {
            console.log(detail, 'Detail');
            return new orderDetailModel({
                orderId: savedOrder._id,
                productId: detail.productID || null,
                serviceId: detail.serviceID || null,
                quantity: detail.quantity,
                product_price: detail.product_price,
                total_price: detail.total_price,
                service_time: detail.serviceID ? booking_date : null
            });
        });
        const savedOrderDetails = await Promise.all(orderDetailDocs.map((detail) => detail.save({ session })));
        // 9. Commit transaction
        await session.commitTransaction();
        // 10. Send response
        res.status(201).json({
            success: true,
            message: 'Order and order details created successfully',
            data: {
                order: savedOrder,
                orderDetails: savedOrderDetails
            }
        });
    }
    catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in createOrderAfterPayment:', errorMessage);
        res.status(400).json({
            success: false,
            message: errorMessage,
            error: error instanceof Error ? error.stack : 'Unknown error stack'
        });
    }
    finally {
        // End session
        session.endSession();
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