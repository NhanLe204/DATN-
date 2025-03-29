import mongoose from 'mongoose';
import rateModel from '../models/rate.model.js';
import { Request, Response } from 'express';
import orderModel from '../models/order.model.js';
import userModel from '../models/user.model.js';
import PaymentType from '../models/paymentType.model.js';
import deliveryModel from '../models/delivery.model.js';
import couponModel from '../models/coupon.model.js';
import { CouponStatus } from '../enums/coupon.enum.js';
import orderDetailModel from '../models/orderdetail.model.js';
import ServiceModel from '../models/service.model.js';
import productModel from '../models/product.model.js';
import { OrderStatus, PaymentStatus } from '../enums/order.enum.js';
import { ProductStatus } from '../enums/product.enum.js';
import { ServiceStatus } from '../enums/service.enum.js';
import serviceModel from '../models/service.model.js';

export const createOrderAfterPayment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userID = null,
      payment_typeID,
      deliveryID = null,
      couponID = null,
      orderdate,
      total_price,
      shipping_address = null,
      transaction_id,
      orderDetails,
      infoUserGuest = null // Thông tin người dùng khách hàng nếu không đăng nhập
    } = req.body;

    // 1. Validate input data (các trường bắt buộc chung)
    if (!total_price || !transaction_id || !orderDetails || !Array.isArray(orderDetails)) {
      throw new Error('Missing required fields');
    }

    // Xác định đây là booking hay order dựa trên orderDetails
    const isBooking = orderDetails.every((detail: any) => detail.serviceID && !detail.productID);
    const isOrder = orderDetails.some((detail: any) => detail.productID);

    // Nếu là order sản phẩm, yêu cầu deliveryID
    if (isOrder && !deliveryID) {
      throw new Error('Delivery ID is required for product orders');
    }

    // 2. Validate user existence
    if (userID !== null) {
      const user = await userModel.findById(userID).session(session);
      if (!user) throw new Error('User not found');
    }

    // 3. Validate payment type
    if (payment_typeID) {
      const paymentType = await PaymentType.findById(payment_typeID).session(session);
      if (!paymentType) throw new Error('Payment type not found');
    }

    // 4. Validate delivery (chỉ khi là order)
    let delivery = null;
    if (deliveryID) {
      delivery = await deliveryModel.findById(deliveryID).session(session);
      if (!delivery) throw new Error('Delivery method not found');
    }
    const deliveryFee = delivery.delivery_fee || 0;

    // 5. Handle coupon validation and discount calculation
    let discount = 0;
    if (couponID) {
      const coupon = await couponModel.findById(couponID).session(session);
      if (!coupon) throw new Error('Coupon not found');

      const currentDate = new Date();
      if (
        coupon.status !== CouponStatus.ACTIVE ||
        currentDate < coupon.start_date ||
        currentDate > coupon.end_date ||
        coupon.used_count >= coupon.usage_limit
      ) {
        throw new Error('Invalid or expired coupon');
      }

      discount = Math.min(coupon.discount_value, coupon.max_discount);
      await couponModel.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } }, { session });
    }

    // 6. Calculate total_price (verify total_price from client)
    let calculatedTotalPrice = 0;
    const orderDetailsPromises = orderDetails.map(async (detail: any) => {
      const { productID, serviceID, quantity, product_price, booking_date } = detail;

      if (!quantity || !product_price || (!productID && !serviceID)) {
        throw new Error('Invalid order detail data');
      }

      // Validate product nếu có
      if (productID) {
        const product = await productModel
          .findOne({ _id: productID, status: ProductStatus.AVAILABLE })
          .session(session);
        if (!product) throw new Error(`Product not found or not available: ${productID}`);

        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product: ${productID}`);
        }

        await productModel.findByIdAndUpdate(productID, { $inc: { stock: -quantity } }, { session });
      }

      // Validate service nếu có
      if (serviceID) {
        const service = await serviceModel.findOne({ _id: serviceID, status: ServiceStatus.ACTIVE }).session(session);
        if (!service) throw new Error(`Service not found or not active: ${serviceID}`);
      }

      const detailTotalPrice = quantity * product_price;
      calculatedTotalPrice += detailTotalPrice;

      return { productID, serviceID, quantity, product_price, total_price: detailTotalPrice, booking_date };
    });

    const validatedOrderDetails = await Promise.all(orderDetailsPromises);
    const subtotal = calculatedTotalPrice; // Tổng tiền sản phẩm/dịch vụ

    // Verify total_price
    const discountedSubtotal = calculatedTotalPrice - discount;
    const finalTotalPrice = discountedSubtotal + deliveryFee; // Thêm phí vận chuyển

    // Log để kiểm tra giá trị
    console.log('Subtotal:', subtotal);
    console.log('Discount:', discount);
    console.log('Delivery Fee:', deliveryFee);
    console.log('Final Total Price (Backend):', finalTotalPrice);
    console.log('Total Price (Client):', total_price);

    // Verify total_price từ client
    if (Math.abs(finalTotalPrice - total_price) > 1) {
      throw new Error('Total price mismatch');
    }

    // 7. Create and save order
    const order = new orderModel({
      userID: userID ? userID : '',
      payment_typeID,
      deliveryID: isOrder ? deliveryID : null,
      couponID: couponID || null,
      orderdate: orderdate ? new Date(orderdate) : new Date(),
      total_price: finalTotalPrice,
      shipping_address,
      status: OrderStatus.PENDING,
      transaction_id,
      inforUserGuest: infoUserGuest || null // Thông tin người dùng khách hàng nếu không đăng nhập
    });

    const savedOrder = await order.save({ session });

    // 8. Create and save order details
    const orderDetailDocs = validatedOrderDetails.map((detail: any) => {
      return new orderDetailModel({
        orderId: savedOrder._id,
        productId: detail.productID || null,
        serviceId: detail.serviceID || null,
        quantity: detail.quantity,
        product_price: detail.product_price,
        total_price: detail.total_price,
        booking_date: detail.serviceID ? detail.booking_date : null // Sử dụng booking_date từ từng orderDetail
      });
    });

    const savedOrderDetails = await Promise.all(orderDetailDocs.map((detail: any) => detail.save({ session })));

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
  } catch (error) {
    await session.abortTransaction();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in createOrderAfterPayment:', errorMessage);

    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.stack : 'Unknown error stack'
    });
  } finally {
    session.endSession();
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await orderModel
      .find()
      .populate('userID')
      .populate('payment_typeID')
      .populate('deliveryID')
      .populate('couponID');
    res.status(200).json({ success: true, result: orders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching orders: ${errorMessage}`);
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching order: ${errorMessage}`);
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};

export const checkAvailableSlots = async (req: Request, res: Response): Promise<void> => {
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
    const bookedPets = await orderDetailModel.countDocuments({
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
  } catch (error) {
    console.error('Error checking slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
