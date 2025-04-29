import { Request, Response } from 'express';
import orderModel from '../models/order.model.js';
import bookingModel from '../models/booking.model.js';
import serviceModel from '../models/service.model.js';
import { BookingStatus } from '../enums/booking.enum.js';
import orderDetailModel from '@/models/orderdetail.model.js';

export const getRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type = 'daily', from, to } = req.query;

    // Định dạng ngày cho group
    const groupFormat = type === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

    // Điều kiện lọc cho order
    const matchOrder: any = {
      payment_status: { $in: ['PAID', 'CASH_ON_DELIVERY'] }
    };
    if (from && to) {
      matchOrder.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }

    // 1. Lấy doanh thu bán hàng từ orderModel
    const orders = await orderModel.find(matchOrder).lean(); // .lean() để trả về plain JS object, tăng hiệu suất
    const orderRevenueMap: Record<string, number> = {};

    // Nhóm và tính tổng doanh thu bán hàng
    for (const order of orders) {
      const date = formatDate(order.createdAt, groupFormat);
      orderRevenueMap[date] = (orderRevenueMap[date] || 0) + order.total_price;
    }

    // 2. Lấy doanh thu dịch vụ spa từ orderDetailModel
    const matchOrderDetail: any = {};
    if (from && to) {
      matchOrderDetail.updatedAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string)
      };
    }

    const orderDetails = await orderDetailModel
      .find(matchOrderDetail)
      .populate({
        path: 'orderId',
        match: { bookingStatus: BookingStatus.COMPLETED }
      })
      .lean();

    const bookingRevenueMap: Record<string, number> = {};

    // Nhóm và tính tổng doanh thu dịch vụ
    for (const detail of orderDetails) {
      if (!detail.orderId) continue; // Bỏ qua nếu không có order khớp
      const date = formatDate(detail.updatedAt, groupFormat);
      bookingRevenueMap[date] = (bookingRevenueMap[date] || 0) + detail.realPrice;
    }

    // 3. Merge kết quả
    const merged = mergeRevenue(orderRevenueMap, bookingRevenueMap);

    res.json({ success: true, data: merged });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
    return;
  }
};

// Hàm định dạng ngày
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (format === '%Y-%m') {
    return `${year}-${month}`;
  }
  return `${year}-${month}-${day}`;
};

// Hàm ghép dữ liệu order + booking
const mergeRevenue = (orderRevenueMap: Record<string, number>, bookingRevenueMap: Record<string, number>) => {
  const map: Record<string, { salesRevenue: number; serviceRevenue: number }> = {};

  // Thêm doanh thu bán hàng
  for (const date in orderRevenueMap) {
    map[date] = { salesRevenue: orderRevenueMap[date], serviceRevenue: 0 };
  }

  // Thêm doanh thu dịch vụ
  for (const date in bookingRevenueMap) {
    if (map[date]) {
      map[date].serviceRevenue = bookingRevenueMap[date];
    } else {
      map[date] = { salesRevenue: 0, serviceRevenue: bookingRevenueMap[date] };
    }
  }

  // Chuyển thành mảng và tính tổng
  const result = Object.keys(map)
    .map((date) => {
      const sales = map[date].salesRevenue;
      const service = map[date].serviceRevenue;
      return {
        date,
        salesRevenue: sales,
        serviceRevenue: service,
        totalRevenue: sales + service
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // Sắp xếp theo ngày

  return result;
};
