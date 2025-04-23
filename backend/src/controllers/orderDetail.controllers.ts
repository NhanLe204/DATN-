import { NextFunction, Request, Response } from 'express';
import orderDetailModel from '../models/orderdetail.model.js';
import orderModel from '../models/order.model.js';
import mongoose from 'mongoose';
import { BookingStatus } from '../enums/booking.enum.js';

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

    if (!orderId || (!productId && !serviceId) || !quantity || !product_price || !isRated) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const orderDetail = new orderDetailModel({
      orderId,
      productId: productId || null,
      serviceId: serviceId || null,
      quantity,
      product_price,
      total_price,
      booking_date: serviceId ? booking_date : null,
      booking_time: serviceId ? booking_date : null,
      isRated
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

export const getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Bước 1: Lấy tất cả các order
    const allOrders = await orderModel.find().select('_id');

    if (!allOrders.length) {
      res.status(404).json({ success: false, message: 'No orders found' });
      return;
    }

    // Lấy danh sách orderId
    const orderIds = allOrders.map((order) => order._id);
    console.log(orderIds, 'orderIds');

    // Bước 2: Tìm orderDetail có serviceId từ tất cả các order
    const bookings = await orderDetailModel.aggregate([
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
              $ifNull: ['$user.fullname', '$order.infoUserGuest.fullName']
            },
            email: {
              $ifNull: ['$user.email', '$order.infoUserGuest.email']
            },
            phone: {
              $cond: {
                if: { $or: [{ $eq: ['$user.phone_number', ''] }, { $eq: ['$user.phone_number', null] }] },
                then: { $ifNull: ['$order.phone', '$order.infoUserGuest.phone', ''] },
                else: '$user.phone_number'
              }
            }
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
          petType: 1,
          petWeight: 1,
          realPrice: 1
        }
      }
    ]);

    if (!bookings.length) {
      res.status(404).json({ success: false, message: 'No bookings found' });
      return;
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    res.status(500).json({ success: false, message: 'Error retrieving bookings', error });
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

    // Validate input
    if (!orderId || !bookingStatus) {
      res.status(400).json({
        success: false,
        message: 'orderId and bookingStatus are required'
      });
      return;
    }

    // Validate bookingStatus
    if (!Object.values(BookingStatus).includes(bookingStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid booking status. Must be one of: ${Object.values(BookingStatus).join(', ')}`
      });
      return;
    }

    // Check if order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if this order has any booking (service) details
    const bookingDetail = await orderDetailModel.findOne({
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

    // Update only bookingStatus and status (if needed)
    const updateFields: { bookingStatus: string; status?: string } = { bookingStatus };

    // Optionally, update order status based on booking status
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

    // Update order with specific fields
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        orderId: updatedOrder._id,
        bookingStatus: updatedOrder.bookingStatus,
        orderStatus: updatedOrder.status
      }
    });
  } catch (error) {
    console.error('Error changing booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error
    });
  }
};

export const getCancelledBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy tất cả các order có bookingStatus là CANCELLED
    const cancelledOrders = await orderModel
      .find({
        bookingStatus: BookingStatus.CANCELLED
      })
      .select('_id');

    if (!cancelledOrders.length) {
      res.status(404).json({
        success: false,
        message: `Không tìm thấy booking nào có trạng thái ${BookingStatus.CANCELLED}`
      });
      return;
    }

    // Lấy danh sách orderId
    const orderIds = cancelledOrders.map((order) => order._id);

    // Tìm các orderDetail liên quan đến các booking đã hủy
    const cancelledBookings = await orderDetailModel.aggregate([
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
  } catch (error) {
    console.error('Error retrieving cancelled bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving cancelled bookings',
      error
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
    const { orderId, serviceId, petName, petType, bookingDate, bookingTime, bookingStatus, username } = req.body;

    // Validate input
    if (!orderId || !serviceId || !petName || !petType || !bookingDate || !bookingTime || !bookingStatus) {
      res.status(400).json({
        success: false,
        message: 'Yêu cầu đầy đủ các trường: orderId, serviceId, petName, petType, bookingDate, bookingTime, bookingStatus'
      });
      return;
    }

    // Kiểm tra order tồn tại
    const order = await orderModel.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
      return;
    }

    // Kiểm tra orderDetail tồn tại
    const orderDetail = await orderDetailModel.findOne({ orderId, serviceId: { $ne: null } });
    if (!orderDetail) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi tiết đơn hàng với dịch vụ'
      });
      return;
    }

    // Cập nhật orderDetail
    const updatedOrderDetail = await orderDetailModel.findOneAndUpdate(
      { orderId, serviceId: { $ne: null } },
      {
        $set: {
          serviceId,
          petName,
          petType,
          booking_date: new Date(bookingDate),
          booking_time: bookingTime,
        }
      },
      { new: true }
    );

    // Cập nhật bookingStatus và username trong order
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          bookingStatus,
          'infoUserGuest.fullName': username, // Nếu cần cập nhật username cho khách
        }
      },
      { new: true }
    );

    if (!updatedOrderDetail || !updatedOrder) {
      res.status(500).json({
        success: false,
        message: 'Không thể cập nhật thông tin booking'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin booking thành công',
      data: {
        orderId,
        serviceId,
        petName,
        petType,
        bookingDate: updatedOrderDetail.booking_date,
        bookingTime: updatedOrderDetail.booking_time,
        bookingStatus: updatedOrder.bookingStatus,
        username
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật booking',
      error
    });
  }
};
