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
import { BookingStatus } from '../enums/booking.enum.js';
import sendBookingEmail from '../utils/sendBookingEmail.js';
import sendEmail from '../utils/sendEmail.js';

export const createOrderAfterPayment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let transactionCommitted = false;

  try {
    const {
      userID = null,
      payment_typeID,
      deliveryID = null,
      couponID = null,
      orderdate,
      total_price,
      shipping_address = null,
      orderDetails,
      paymentOrderCode = null,
      infoUserGuest = null,
    } = req.body;

    console.log('req.body.orderDetails:', JSON.stringify(orderDetails, null, 2));

    // 1. Validate input data
    if (!total_price || !orderDetails || !Array.isArray(orderDetails)) {
      throw new Error('Missing required fields');
    }

    // Ánh xạ key để đồng nhất
    const normalizedOrderDetails = orderDetails.map((detail: any) => ({
      productId: detail.productId || detail.productID || null,
      serviceId: detail.serviceId || detail.serviceID || null,
      quantity: detail.quantity,
      product_price: detail.product_price || detail.productPrice,
      booking_date: detail.booking_date || detail.bookingDate,
      petName: detail.petName,
      petType: detail.petType,
    }));

    const isBooking = normalizedOrderDetails.every((detail: any) => detail.serviceId && !detail.productId);
    const isOrder = normalizedOrderDetails.some((detail: any) => detail.productId);

    console.log('normalizedOrderDetails:', JSON.stringify(normalizedOrderDetails, null, 2));
    console.log('isBooking:', isBooking);
    console.log('isOrder:', isOrder);

    if (isOrder && !deliveryID) {
      throw new Error('Delivery ID is required for product orders');
    }

    // 4. Validate delivery
    let deliveryFee = 0;
    if (isOrder && deliveryID) {
      const delivery = await deliveryModel.findById(deliveryID).session(session);
      if (!delivery) throw new Error('Delivery method not found');
      deliveryFee = delivery?.delivery_fee || 0;
    }

    // 6. Calculate total_price
    let calculatedTotalPrice = 0;
    const orderDetailsPromises = normalizedOrderDetails.map(async (detail: any) => {
      const { productId, serviceId, quantity, product_price, booking_date, petName, petType } = detail;

      if (!quantity || !product_price || (!productId && !serviceId)) {
        console.log('Invalid detail:', JSON.stringify(detail, null, 2));
        throw new Error('Invalid order detail data');
      }

      if (productId) {
        const product = await productModel
          .findOne({ _id: productId, status: ProductStatus.AVAILABLE })
          .session(session);
        if (!product) throw new Error(`Product not found or not available: ${productId}`);
        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product: ${productId}`);
        }
        await productModel.findByIdAndUpdate(productId, { $inc: { stock: -quantity } }, { session });
      }

      if (serviceId) {
        const service = await serviceModel
          .findOne({ _id: serviceId, status: ServiceStatus.ACTIVE })
          .session(session);
        if (!service) throw new Error(`Service not found or not active: ${serviceId}`);
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
        petType: serviceId ? petType : null,
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

    const discountedSubtotal = subtotal - discount;
    const finalTotalPrice = isOrder ? discountedSubtotal + deliveryFee : discountedSubtotal;

    if (Math.abs(finalTotalPrice - total_price) > 1) {
      throw new Error('Total price mismatch');
    }
    console.log(infoUserGuest, 'infoUserGuest');

    // 7. Create and save order
    const order = new orderModel({
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
      status: isOrder ? OrderStatus.PENDING : null,
      bookingStatus: isBooking ? BookingStatus.CONFIRMED : null,
      payment_status: PaymentStatus.PENDING,
      inforUserGuest: infoUserGuest || null,
    });

    const savedOrder = await order.save({ session });

    // 8. Create and save order details
    const orderDetailDocs = validatedOrderDetails.map((detail: any) => {
      return new orderDetailModel({
        orderId: savedOrder._id,
        productId: detail.productId || null,
        serviceId: detail.serviceId || null,
        quantity: detail.quantity,
        product_price: detail.product_price,
        total_price: detail.total_price,
        booking_date: detail.booking_date,
        petName: detail.petName,
        petType: detail.petType,
      });
    });

    await Promise.all(orderDetailDocs.map((detail: any) => detail.save({ session })));

    // 9. Commit transaction
    await session.commitTransaction();
    transactionCommitted = true;

    // 10. Send email confirmation (chỉ cho booking)
    let recipientEmail: string | null = null;
    if (userID) {
      const user = await userModel.findById(userID); // Sửa lại để dùng userModel
      recipientEmail = user?.email || null;
    } else if (infoUserGuest && infoUserGuest.email) {
      recipientEmail = infoUserGuest.email;
    }

    if (recipientEmail && isBooking) { // Chỉ gửi email nếu là booking
      try {
        await sendBookingEmail({
          recipientEmail,
          orderDetails: validatedOrderDetails.map((detail) => ({
            serviceId: detail.serviceId,
            booking_date: detail.booking_date,
            petName: detail.petName,
            petType: detail.petType,
          })),
          orderId: savedOrder._id.toString(),
        });
        console.log('Booking email sent to:', recipientEmail);
      } catch (emailError) {
        console.error('Failed to send booking email:', emailError);
      }
    } else if (recipientEmail && isOrder) {
      console.log('Skipping email for product order as per requirement');
    } else {
      console.warn('No recipient email found, skipping email notification');
    }

    // 11. Send response
    res.status(201).json({
      success: true,
      message: 'Order and order details created successfully',
      data: {
        order: savedOrder,
        orderDetails: orderDetailDocs,
      },
    });
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in createOrderAfterPayment:', errorMessage);

    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.stack : 'Unknown error stack',
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
      .populate('couponID')
      .lean();

    // Lấy order details cho mỗi order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await orderDetailModel
          .find({ orderId: order._id })
          .populate('serviceId')
          .populate('productId')
          .lean();
        return {
          ...order,
          orderDetails: details, // Thêm orderDetails vào response
        };
      })
    );

    res.status(200).json({ success: true, result: ordersWithDetails });
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

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
      return;
    }

    // Kiểm tra xem trạng thái thanh toán có hợp lệ không
    if (!Object.values(PaymentStatus).includes(payment_status as PaymentStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái thanh toán không hợp lệ' });
      return;
    }

    // Cập nhật trạng thái thanh toán
    const updatedOrder = await orderModel.findByIdAndUpdate(id, { payment_status }, { new: true, runValidators: true });

    if (!updatedOrder) {
      res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: 'Trạng thái thanh toán được cập nhật thành công', order: updatedOrder });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating payment status: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    } else {
      console.error('Lỗi không xác định khi cập nhật trạng thái thanh toán:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};


export const cancelServiceBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, orderDetailId } = req.body;

    // 1. Kiểm tra đầu vào
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'Order ID không hợp lệ' });
      return;
    }
    if (!orderDetailId || !mongoose.Types.ObjectId.isValid(orderDetailId)) {
      res.status(400).json({ success: false, message: 'Order Detail ID không hợp lệ' });
      return;
    }

    // 2. Tìm order
    const order = await orderModel.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
      return;
    }

    // 3. Tìm orderDetail
    const orderDetail = await orderDetailModel
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
    if (order.bookingStatus !== BookingStatus.CONFIRMED) {
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
        message: `Không thể hủy booking trước ${cancelDeadlineHours} tiếng`,
      });
      return;
    }

    // 5. Cập nhật trạng thái
    order.bookingStatus = BookingStatus.CANCELLED;
    await order.save();
    console.log('Order updated with status:', order.bookingStatus);

    // 6. Gửi email thông báo hủy dịch vụ
    let recipientEmail: string | null = null;
    let customerName: string = 'Khách hàng';
    if (order.userID) {
      const user = await userModel.findById(order.userID);
      recipientEmail = user?.email || null;
      customerName = user?.fullname || 'Khách hàng';
    } else if (order.inforUserGuest?.email) {
      recipientEmail = order.inforUserGuest.email;
      customerName = order.inforUserGuest.fullName || 'Khách hàng';
    }

    if (recipientEmail) {
      // Định dạng ngày giờ theo kiểu Việt Nam
      const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Ho_Chi_Minh',
        }).format(date);
      };

      // Định dạng giá tiền
      const formatPrice = (price: number) => {
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
      const text = `Kính gửi ${customerName},\n\nLịch đặt dịch vụ của bạn đã được hủy thành công! Dưới đây là thông tin chi tiết về lịch hẹn đã hủy:\n\nDịch vụ: ${serviceName}\nThời gian: ${bookingTime}\nThú cưng: ${petName} (${petType})\nGiá dự tính: ${formatPrice(servicePrice)}\nThời gian dự kiến: ${duration} phút\nĐịa điểm: 123 Nguyen Van Cu, District 1, HCM City\nMã đặt lịch: ${orderIdString}\n\nNếu bạn cần thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline 19006336 hoặc email ngocthanhnt04@gmail.com.\n\nTrân trọng,\nPet Heaven`;
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
        await sendEmail(recipientEmail, subject, text, html);
        console.log('Cancellation email sent to:', recipientEmail);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    } else {
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
        status: order.status,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in cancelServiceBooking:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi hủy đặt lịch dịch vụ',
      details: errorMessage,
    });
  }
};