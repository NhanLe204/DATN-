import { NextFunction, Request, Response } from 'express';
import orderDetailModel from '../models/orderdetail.model.js';
import orderModel from '../models/order.model.js';
import mongoose from 'mongoose';
import { BookingStatus } from '../enums/booking.enum.js';
import moment from 'moment-timezone';
import dayjs from 'dayjs';
import schedule from 'node-schedule';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import userModel from '@/models/user.model.js';
import sendBookingEmail from '@/utils/sendBookingEmail.js';
import ServiceModel from '@/models/service.model.js';
dayjs.extend(utc);
dayjs.extend(timezone);
// Lấy danh sách tất cả order details
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderDetails = await orderDetailModel.find();
    res.status(200).json({ success: true, data: orderDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order details', error });
  }
};

// Lấy order details theo orderId
export const getOrderDetailsByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const orderDetails = await orderDetailModel
      .find({ orderId: id })
      .populate('productId')
      .populate('orderId')
      .populate('serviceId');

    if (!orderDetails.length) {
      res.status(404).json({ success: false, message: 'No order details found for this order' });
      return;
    }

    res.status(200).json({ success: true, data: orderDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving order details', error });
  }
};

// Tạo order detail mới
export const createOrderDetail = async (req: Request, res: Response) => {
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
    const standardizedBookingDate =
      serviceId && booking_date ? moment.tz(booking_date, 'Asia/Ho_Chi_Minh').utc().toDate() : null;

    const orderDetail = new orderDetailModel({
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order detail', error });
  }
};

// Cập nhật order detail theo ID
export const updateOrderDetail = async (req: Request, res: Response) => {
  try {
    const updatedOrderDetail = await orderDetailModel.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedOrderDetail) {
      return res.status(404).json({ success: false, message: 'Order detail not found' });
    }

    res.status(200).json({ success: true, message: 'Order detail updated successfully', data: updatedOrderDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order detail', error });
  }
};

// Xóa order detail theo ID
export const deleteOrderDetail = async (req: Request, res: Response) => {
  try {
    const deletedOrderDetail = await orderDetailModel.findByIdAndDelete(req.params.id);
    if (!deletedOrderDetail) {
      return res.status(404).json({ success: false, message: 'Order detail not found' });
    }
    res.status(200).json({ success: true, message: 'Order detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting order detail', error });
  }
};

export const getBookingsByUserId = async (
  req: Request<object, object, object, { userId?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required' });
      return;
    }

    // Bước 1: Kiểm tra xem user có order nào không
    const userOrders = await orderModel.find({ userID: userId }).select('_id');

    if (!userOrders.length) {
      res.status(404).json({ success: false, message: 'No orders found for this user' });
      return;
    }

    // Lấy danh sách orderId
    const orderIds = userOrders.map((order) => order._id);

    // Bước 2: Tìm orderDetail có serviceId từ các order của user
    const bookings = await orderDetailModel.aggregate([
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving bookings', error });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Bước 1: Lấy tất cả các order có bookingStatus
    const allOrders = await orderModel
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
    const bookings = await orderDetailModel.aggregate([
      {
        $match: {
          orderId: { $in: orderIds },
          serviceId: { $ne: null },
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $unwind: '$order',
      },
      {
        $unwind: '$service',
      },
      {
        $project: {
          orderId: '$order._id',
          fullname: {
            $ifNull: [
              '$order.fullname',
              '$order.inforUserGuest.fullName',
              'Khách vãng lai',
            ],
          },
          email: {
            $ifNull: ['$order.email', '$order.inforUserGuest.email', null],
          },
          phone: {
            $ifNull: ['$order.phone', '$order.inforUserGuest.phone', 'Unknown Phone'],
          },
          service: {
            _id: '$service._id',
            name: '$service.service_name',
            price: '$service.service_price',
            duration: '$service.duration',
          },
          booking_date: '$booking_date',
          order_date: '$order.order_date',
          bookingStatus: '$order.bookingStatus',
          petName: '$petName',
          petType: '$petType',
          petWeight: '$petWeight',
          realPrice: '$realPrice',
        },
      },
    ]);

    if (!bookings.length) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn nào',
      });
      return;
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch hẹn',
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const getOrderByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID', data: [] });
      return;
    }

    const userOrders = await orderModel
      .find({ userID: userId })
      .populate('payment_typeID', 'payment_type_name')
      .populate('deliveryID', 'delivery_fee')
      .populate('couponID', 'discount_value coupon_code');

    if (!userOrders || userOrders.length === 0) {
      res.status(404).json({ success: false, message: 'No orders found for this user', data: [] });
      return;
    }

    const orderIds = userOrders.map((order) => order._id);

    const orderDetails = await orderDetailModel
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

        if (relatedDetails.length === 0) return null;

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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving orders by user ID', data: [] });
  }
};
export const changeBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, bookingStatus } = req.body;

    // Xác thực đầu vào
    if (!orderId || !bookingStatus) {
      res.status(400).json({
        success: false,
        message: 'orderId và bookingStatus là bắt buộc',
      });
      return;
    }

    // Xác thực trạng thái lịch hẹn
    if (!Object.values(BookingStatus).includes(bookingStatus)) {
      res.status(400).json({
        success: false,
        message: `Trạng thái lịch hẹn không hợp lệ. Phải là một trong: ${Object.values(BookingStatus).join(', ')}`,
      });
      return;
    }

    // Bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await orderModel.findById(orderId).session(session);
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng',
        });
        return;
      }

      // Kiểm tra đơn hàng có chi tiết dịch vụ không
      const bookingDetail = await orderDetailModel
        .findOne({ orderId: orderId, serviceId: { $ne: null } })
        .session(session);
      if (!bookingDetail) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn cho đơn hàng này',
        });
        return;
      }

      // Kiểm tra nếu trạng thái hiện tại là COMPLETED
      if (order.bookingStatus === BookingStatus.COMPLETED) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
          success: false,
          message: 'Không thể thay đổi trạng thái của lịch hẹn đã hoàn thành',
        });
        return;
      }

      // Xác thực chuyển đổi trạng thái
      const validStatusTransitions: { [key: string]: string[] } = {
        [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
        [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
        [BookingStatus.COMPLETED]: [],
        [BookingStatus.CANCELLED]: [],
      };

      const currentStatus = order.bookingStatus || BookingStatus.PENDING;
      if (!validStatusTransitions[currentStatus].includes(bookingStatus)) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
          success: false,
          message: `Chuyển đổi trạng thái không hợp lệ từ ${currentStatus} sang ${bookingStatus}`,
        });
        return;
      }

      // Cập nhật trạng thái lịch hẹn và trạng thái đơn hàng
      const updateFields: { bookingStatus: string; status?: string } = {
        bookingStatus,
      };
      switch (bookingStatus) {
        case BookingStatus.PENDING:
          updateFields.status = 'pending';
          break;
        case BookingStatus.CONFIRMED:
          updateFields.status = 'confirmed';
          break;
        case BookingStatus.IN_PROGRESS:
          updateFields.status = 'processing';
          break;
        case BookingStatus.COMPLETED:
          updateFields.status = 'completed';
          break;
        case BookingStatus.CANCELLED:
          updateFields.status = 'cancelled';
          break;
      }

      // Cập nhật đơn hàng
      const updatedOrder = await orderModel
        .findByIdAndUpdate(orderId, { $set: updateFields }, { new: true, session })
        .session(session);

      if (!updatedOrder) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
          success: false,
          message: 'Không thể cập nhật trạng thái lịch hẹn',
        });
        return;
      }

      // Gửi email khi trạng thái là COMPLETED
      if (bookingStatus === BookingStatus.COMPLETED) {
        try {
          const user = await userModel.findById(order.userID).session(session);
          const orderDetail = await orderDetailModel
            .findOne({ orderId, serviceId: { $ne: null } })
            .session(session);

          const userData = user
            ? { email: user.email, name: user.fullname }
            : order.infoUserGuest
            ? { email: order.infoUserGuest.email, name: order.infoUserGuest.fullName }
            : null;

          console.log('User data for email:', userData);
          console.log('Order detail:', orderDetail);

          if (userData && userData.email && orderDetail) {
            const service = await ServiceModel.findById(orderDetail.serviceId).select('service_name');
            const emailData: BookingEmailData = {
              recipientEmail: userData.email,
              customerName: userData.name,
              orderDetails: [
                {
                  serviceId: orderDetail.serviceId?.toString() || null,
                  booking_date: orderDetail.booking_date || null,
                  petName: orderDetail.petName || null,
                  petType: orderDetail.petType || null,
                },
              ],
              orderId: orderId,
              isCancellation: false,
            };

            // Gửi email sử dụng sendBookingEmail với nội dung tùy chỉnh
            await sendBookingEmail({
              ...emailData,
              subject: `Dịch vụ của bạn đã hoàn thành - Mã đơn hàng: ${orderId}`,
              html: `
                <p>Kính gửi <strong>${userData.name || 'Khách hàng'}</strong>,</p>
                <p>Chúng tôi xin thông báo rằng dịch vụ của bạn đã được hoàn thành thành công!</p>
                <ul>
                  <li><strong>Mã đơn hàng:</strong> ${orderId}</li>
                  <li><strong>Dịch vụ:</strong> ${service?.service_name || 'Không xác định'}</li>
                  <li><strong>Thời gian:</strong> ${
                    orderDetail.booking_date
                      ? new Intl.DateTimeFormat('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(orderDetail.booking_date)
                      : 'N/A'
                  }</li>
                  <li><strong>Thú cưng:</strong> ${orderDetail.petName || 'N/A'} (${orderDetail.petType || 'N/A'})</li>
                  <li><strong>Giá thực tế:</strong> ${
                    orderDetail.realPrice ? orderDetail.realPrice.toLocaleString('vi-VN') + ' VND' : 'N/A'
                  }</li>
                </ul>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Trân trọng,<br><strong>Pet Heaven</strong></p>
              `,
            });
            console.log(`Completion email sent to ${userData.email} for order ${orderId}`);
          } else {
            console.warn(`No valid email found for order ${orderId}. Skipping email.`);
          }
        } catch (emailError) {
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
          orderStatus: updatedOrder.status,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái lịch hẹn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái lịch hẹn',
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, orderDetailId } = req.body;

    // Validate input
    if (!orderId || !orderDetailId) {
      res.status(400).json({
        success: false,
        message: 'orderId and orderDetailId are required',
      });
      return;
    }

    // Check if order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check if orderDetail exists
    const orderDetail = await orderDetailModel.findOne({
      _id: orderDetailId,
      orderId,
      serviceId: { $ne: null },
    });
    if (!orderDetail) {
      res.status(404).json({
        success: false,
        message: 'Chi tiết đơn hàng không tồn tại',
      });
      return;
    }
    // ... (phần còn lại của logic)
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error,
    });
  }
};


// Bảng giá
const bathData = [
  { weight: "< 5kg", price: 150000 },
  { weight: "5 - 10kg", price: 200000 },
  { weight: "10 - 20kg", price: 250000 },
  { weight: "20 - 40kg", price: 300000 },
  { weight: "> 40kg", price: 350000 },
];

const comboBathData = [
  { weight: "< 5kg", price: 320000 },
  { weight: "5 - 10kg", price: 520000 },
  { weight: "10 - 20kg", price: 620000 },
  { weight: "20 - 40kg", price: 720000 },
  { weight: "> 40kg", price: 820000 },
];

const serviceBathData = [
  { weight: "< 5kg", price: 150000 },
  { weight: "5 - 10kg", price: 180000 },
  { weight: "10 - 20kg", price: 210000 },
  { weight: "20 - 40kg", price: 240000 },
  { weight: "> 40kg", price: 270000 },
];

// Hàm calculatePrice
const calculatePrice = (
  serviceName: string,
  petWeight: number,
  petType: string
): number => {
  const getWeightRange = (weight: number): string => {
    if (weight < 5) return "< 5kg";
    if (weight >= 5 && weight <= 10) return "5 - 10kg";
    if (weight > 10 && weight <= 20) return "10 - 20kg";
    if (weight > 20 && weight <= 40) return "20 - 40kg";
    return "> 40kg";
  };

  const weightRange = getWeightRange(petWeight);
  const normalizedServiceName = serviceName.toLowerCase();

  if (
    normalizedServiceName.includes("tắm") &&
    !normalizedServiceName.includes("combo")
  ) {
    const priceEntry = bathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  } else if (normalizedServiceName.includes("combo")) {
    const priceEntry = comboBathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  } else if (
    normalizedServiceName.includes("cắt") ||
    normalizedServiceName.includes("tỉa") ||
    normalizedServiceName.includes("cạo")
  ) {
    const priceEntry = serviceBathData.find((item) => item.weight === weightRange);
    return priceEntry ? priceEntry.price : 0;
  }

  return 0;
};

// API updateRealPrice
export const updateRealPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, petWeight, petType, serviceName } = req.body;
    // Kiểm tra dữ liệu đầu vào
    if (!orderId || petWeight == null || !petType || !serviceName) {
      res.status(400).json({
        success: false,
        message: `Yêu cầu đầy đủ các trường: orderId=${orderId}, petWeight=${petWeight}, petType=${petType}, serviceName=${serviceName}`,
      });
      return;
    }

    // Kiểm tra petWeight hợp lệ
    if (typeof petWeight !== 'number' || petWeight < 0 || petWeight > 100) {
      res.status(400).json({
        success: false,
        message: `Cân nặng phải là số từ 0 đến 100 kg, nhận được: ${petWeight}`,
      });
      return;
    }

    // Tính giá thực tế
    const realPrice = calculatePrice(serviceName, petWeight, petType);

    // Kiểm tra realPrice hợp lệ
    if (realPrice === 0) {
      res.status(400).json({
        success: false,
        message: `Không thể tính giá cho dịch vụ "${serviceName}" với cân nặng ${petWeight} kg`,
      });
      return;
    }

    // Cập nhật orderDetail với realPrice
    const updatedOrderDetail = await orderDetailModel.findOneAndUpdate(
      { orderId, serviceId: { $ne: null } },
      { $set: { realPrice } },
      { new: true }
    );

    if (!updatedOrderDetail) {
      res.status(404).json({
        success: false,
        message: `Không tìm thấy chi tiết đơn hàng với orderId=${orderId} và serviceId không null`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật giá thực tế thành công",
      data: {
        orderId,
        realPrice,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật giá thực tế:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật giá thực tế",
    });
  }
};


// update
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, bookingDate, serviceId, petName, petType, fullname, bookingStatus } = req.body;

    // Validate orderId
    if (!orderId || typeof orderId !== 'string' || !mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('Invalid orderId:', orderId);
      res.status(400).json({
        success: false,
        message: 'orderId không hợp lệ',
      });
      return;
    }

    // Find order and orderDetail
    const order = await orderModel.findById(orderId);
    const orderDetail = await orderDetailModel.findOne({ orderId });

    if (!order) {
      console.error('Order not found for orderId:', orderId);
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng',
      });
      return;
    }
    if (!orderDetail) {
      console.error('OrderDetail not found for orderId:', orderId);
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi tiết đơn hàng',
      });
      return;
    }

    // Prepare update fields
    const updateOrderFields: any = {};
    const updateOrderDetailFields: any = {};

    // Handle bookingDate
    if (bookingDate) {
      const parsedBookingDate = dayjs(bookingDate, 'YYYY-MM-DD HH:mm:ss', true);
      if (!parsedBookingDate.isValid()) {
        console.error('Invalid bookingDate:', bookingDate);
        res.status(400).json({
          success: false,
          message: 'bookingDate phải có định dạng YYYY-MM-DD HH:mm:ss',
        });
        return;
      }
      updateOrderDetailFields.booking_date = parsedBookingDate.tz('Asia/Ho_Chi_Minh').toDate();
      console.log('Setting booking_date to:', updateOrderDetailFields.booking_date);
    }

    // Handle serviceId
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
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
    } else {
      console.warn('No valid fullname provided for fullname update');
    }

    // Handle bookingStatus
    if (bookingStatus && Object.values(BookingStatus).includes(bookingStatus)) {
      updateOrderFields.bookingStatus = bookingStatus;
      updateOrderFields.status =
        bookingStatus === BookingStatus.PENDING ? 'pending' :
        bookingStatus === BookingStatus.CONFIRMED ? 'confirmed' :
        bookingStatus === BookingStatus.IN_PROGRESS ? 'processing' :
        bookingStatus === BookingStatus.COMPLETED ? 'completed' :
        'cancelled';
      console.log('Setting bookingStatus to:', bookingStatus);
    }

    // Update order if there are changes
    let updatedOrder = order;
    if (Object.keys(updateOrderFields).length > 0) {
      console.log('Updating order with fields:', updateOrderFields);
      updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { $set: updateOrderFields },
        { new: true }
      );
      if (!updatedOrder) {
        console.error('Failed to update order for orderId:', orderId);
        res.status(500).json({
          success: false,
          message: 'Không thể cập nhật đơn hàng',
        });
        return;
      }
      console.log('Updated order:', updatedOrder);
    }

    // Update orderDetail if there are changes
    let updatedOrderDetail = orderDetail;
    if (Object.keys(updateOrderDetailFields).length > 0) {
      console.log('Updating orderDetail with fields:', updateOrderDetailFields);
      updatedOrderDetail = await orderDetailModel.findOneAndUpdate(
        { orderId },
        { $set: updateOrderDetailFields },
        { new: true }
      );
      if (!updatedOrderDetail) {
        console.error('Failed to update orderDetail for orderId:', orderId);
        res.status(500).json({
          success: false,
          message: 'Không thể cập nhật chi tiết đơn hàng',
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
        phone: updatedOrder.phone,
      },
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật booking',
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    });
  }
};

// Hàm mới: Tự động hủy các đặt lịch quá hạn
export const cancelOverdueBookings = () => {
  schedule.scheduleJob('*/1 * * * *', async () => {
    try {
      console.log('Checking for overdue bookings...');
      const now = dayjs().tz('Asia/Ho_Chi_Minh');

      // Find bookings with serviceId and booking_date
      const overdueBookings = await orderDetailModel
        .find({
          serviceId: { $ne: null },
          booking_date: { $ne: null },
        })
        .populate('orderId');

      for (const booking of overdueBookings) {
        const order = booking.orderId;
        if (!order || !order.bookingStatus) {
          console.warn(`Skipping booking with missing order or bookingStatus: ${booking._id}`);
          continue;
        }

        // Skip if already CANCELLED, IN_PROGRESS, or COMPLETED
        if (
          order.bookingStatus === BookingStatus.CANCELLED ||
          order.bookingStatus === BookingStatus.IN_PROGRESS ||
          order.bookingStatus === BookingStatus.COMPLETED
        ) {
          continue;
        }

        // Parse booking_date as the full date-time
        const bookingDateTime = dayjs(booking.booking_date).tz('Asia/Ho_Chi_Minh');

        if (!bookingDateTime.isValid()) {
          console.warn(
            `Invalid booking date for order ${order._id}: ${booking.booking_date}`
          );
          continue;
        }

        // Check if more than 15 minutes have passed since the booking time
        const fifteenMinutesAfter = bookingDateTime.add(15, 'minute');
        if (now.isAfter(fifteenMinutesAfter)) {
          // Update order to CANCELLED
          await orderModel.findByIdAndUpdate(
            order._id,
            {
              $set: {
                bookingStatus: BookingStatus.CANCELLED,
                status: 'cancelled',
              },
            },
            { new: true }
          );
          console.log(`Cancelled overdue booking: ${order._id}`);
        }
      }
    } catch (error) {
      console.error('Error in cancelOverdueBookings job:', error);
    }
  });
};

// Khởi động công việc tự động hủy khi file được load
cancelOverdueBookings();