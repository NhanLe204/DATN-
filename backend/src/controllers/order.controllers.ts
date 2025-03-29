/* eslint-disable @typescript-eslint/no-explicit-any */
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
      paymentOrderCode = null,
      infoUserGuest = null
    } = req.body;
    console.log(paymentOrderCode, 'paymentOrderCode');
    // 1. Validate input data
    if (!total_price || !transaction_id || !orderDetails || !Array.isArray(orderDetails)) {
      throw new Error('Missing required fields');
    }

    const isBooking = orderDetails.every((detail: any) => detail.serviceID && !detail.productID);
    const isOrder = orderDetails.some((detail: any) => detail.productID);

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

    // 4. Validate delivery
    let delivery = null;
    let deliveryFee = 0;
    if (deliveryID) {
      delivery = await deliveryModel.findById(deliveryID).session(session);
      if (!delivery) throw new Error('Delivery method not found');
      deliveryFee = delivery?.delivery_fee || 0;
    }

    // 5. Kiểm tra slot trống cho các booking
    const maxSlots = 5;
    const slotUsage: { [key: string]: number } = {}; // Theo dõi số pet trong từng slot

    for (const detail of orderDetails) {
      const { serviceID, booking_date } = detail;

      if (serviceID && booking_date) {
        const bookingDate = new Date(booking_date);
        if (isNaN(bookingDate.getTime())) {
          throw new Error(`Invalid booking_date format: ${booking_date}`);
        }

        bookingDate.setMinutes(0, 0, 0);
        const date = bookingDate.toISOString().split('T')[0];
        const hour = bookingDate.getHours();

        const service = await serviceModel.findOne({ _id: serviceID, status: ServiceStatus.ACTIVE }).session(session);
        if (!service) throw new Error(`Service not found or not active: ${serviceID}`);

        const serviceDuration = service.duration || 60;
        const affectedSlots = Math.ceil(serviceDuration / 60);

        const timeSlots: { start: Date; end: Date; time: string }[] = [];
        for (let i = 0; i < affectedSlots; i++) {
          const slotHour = hour + i;
          const startDate = new Date(`${date}T${slotHour.toString().padStart(2, '0')}:00:00+07:00`);
          const endDate = new Date(`${date}T${slotHour.toString().padStart(2, '0')}:59:59.999+07:00`);
          timeSlots.push({ start: startDate, end: endDate, time: `${slotHour}h` });
        }

        // Đếm số pet trong request cho từng slot
        for (const slot of timeSlots) {
          const slotKey = `${date}-${slot.time}`;
          slotUsage[slotKey] = (slotUsage[slotKey] || 0) + 1;
        }
      }
    }

    // Kiểm tra slot còn lại so với slotUsage
    for (const detail of orderDetails) {
      const { serviceID, booking_date } = detail;

      if (serviceID && booking_date) {
        const bookingDate = new Date(booking_date);
        bookingDate.setMinutes(0, 0, 0);
        const date = bookingDate.toISOString().split('T')[0];
        const hour = bookingDate.getHours();

        const service = await serviceModel.findOne({ _id: serviceID, status: ServiceStatus.ACTIVE }).session(session);
        const serviceDuration = service.duration || 60;
        const affectedSlots = Math.ceil(serviceDuration / 60);

        const timeSlots: { start: Date; end: Date; time: string }[] = [];
        for (let i = 0; i < affectedSlots; i++) {
          const slotHour = hour + i;
          const startDate = new Date(`${date}T${slotHour.toString().padStart(2, '0')}:00:00+07:00`);
          const endDate = new Date(`${date}T${slotHour.toString().padStart(2, '0')}:59:59.999+07:00`);
          timeSlots.push({ start: startDate, end: endDate, time: `${slotHour}h` });
        }

        for (const slot of timeSlots) {
          const bookedPets = await orderDetailModel
            .countDocuments({
              booking_date: {
                $gte: slot.start,
                $lte: slot.end
              }
            })
            .session(session);

          const slotKey = `${date}-${slot.time}`;
          const totalPetsInSlot = bookedPets + (slotUsage[slotKey] || 0);
          if (totalPetsInSlot > maxSlots) {
            throw new Error(
              `Not enough slots for booking on ${date} at ${slot.time}. Only ${maxSlots - bookedPets} slot(s) remaining.`
            );
          }
        }
      }
    }

    // 6. Calculate total_price
    let calculatedTotalPrice = 0;
    const orderDetailsPromises = orderDetails.map(async (detail: any) => {
      const { productID, serviceID, quantity, product_price, booking_date } = detail;

      if (!quantity || !product_price || (!productID && !serviceID)) {
        throw new Error('Invalid order detail data');
      }

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

      if (serviceID) {
        const service = await serviceModel.findOne({ _id: serviceID, status: ServiceStatus.ACTIVE }).session(session);
        if (!service) throw new Error(`Service not found or not active: ${serviceID}`);
      }

      const detailTotalPrice = quantity * product_price;
      calculatedTotalPrice += detailTotalPrice;

      const standardizedBookingDate = serviceID && booking_date ? new Date(booking_date) : null;
      if (standardizedBookingDate) {
        standardizedBookingDate.setMinutes(0, 0, 0);
      }

      return {
        productID,
        serviceID,
        quantity,
        product_price,
        total_price: detailTotalPrice,
        booking_date: standardizedBookingDate
      };
    });

    const validatedOrderDetails = await Promise.all(orderDetailsPromises);
    const subtotal = calculatedTotalPrice;

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
      const discountPercentage = coupon.discount_value;
      discount = (subtotal * discountPercentage) / 100;
      await couponModel.findByIdAndUpdate(couponID, { $inc: { used_count: 1 } }, { session });
    }

    const discountedSubtotal = calculatedTotalPrice - discount;
    const finalTotalPrice = discountedSubtotal + deliveryFee;

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
      paymentOrderCode,
      status: OrderStatus.PENDING,
      transaction_id,
      inforUserGuest: infoUserGuest || null
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
        booking_date: detail.booking_date
      });
    });

    await Promise.all(orderDetailDocs.map((detail: any) => detail.save({ session })));

    // 9. Commit transaction
    await session.commitTransaction();

    // 10. Send response
    res.status(201).json({
      success: true,
      message: 'Order and order details created successfully',
      data: {
        order: savedOrder,
        orderDetails: orderDetailDocs
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

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query; // Ngày cần kiểm tra, ví dụ: "2025-03-29"
    if (!date) throw new Error('Date is required');

    const maxSlots = 5;
    const availableTimeSlots = ['8h', '9h', '10h', '11h', '13h', '14h', '15h', '16h', '17h'];

    const startOfDay = new Date(`${date}T00:00:00+07:00`);
    const endOfDay = new Date(`${date}T23:59:59.999+07:00`);

    // Lấy tất cả booking trong ngày
    const bookings = await orderDetailModel
      .find({
        booking_date: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate('serviceId');

    // Tính số slot bị chiếm cho từng khung giờ
    const slotOccupancy: { [key: string]: number } = {};
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
    const slotAvailability: { [key: string]: number } = {};
    availableTimeSlots.forEach((time) => {
      slotAvailability[time] = maxSlots - slotOccupancy[time];
    });

    res.status(200).json({
      success: true,
      data: slotAvailability
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('status', status);

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
      return;
    }

    // Kiểm tra xem trạng thái có hợp lệ không
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
      return;
    }

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await orderModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });

    if (!updatedOrder) {
      res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: 'Trạng thái đơn hàng được cập nhật thành công', order: updatedOrder });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating order status: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    } else {
      console.error('Lỗi không xác định khi cập nhật trạng thái đơn hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};
