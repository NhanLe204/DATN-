import dayjs from 'dayjs';
import orderModel from '../models/order.model.js';

/**
 * Sinh orderCode theo format: ODR-YYYYMMDD-xxxx
 * - xxxx: số thứ tự trong ngày
 */
export const generateOrderCode = async (): Promise<string> => {
    const today = dayjs().format('YYYYMMDD');

    // Đếm số order hôm nay
    // countDocuments của moongose đếm số lượng theo điều kiện
    // trong trường hợp này $gte: lớn hơn hoặc bằng
    // $lte: nhỏ hơn hoặc bằng
    // dayjs().startOf('day'): 00:00:00 hôm nay
    // dayjs().endOf('day'): 23:59:59 hôm nay
    const countToday = await orderModel.countDocuments({
        createdAt: {
            $gte: dayjs().startOf('day').toDate(),
            $lte: dayjs().endOf('day').toDate()
        }
    });

    // padStart: nếu chuỗi chưa đủ 4 ký tự thì thêm '0' vào bên trái cho đủ 4 ký tự
    const orderNumber = (countToday + 1).toString().padStart(4, '0');

    return `ODR-${today}-${orderNumber}`;
};
