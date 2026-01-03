import orderDetailModel from '@/models/orderdetail.model.js';

export const checkBookingAvailability = async (
  bookingStart: Date,
  bookingEnd: Date,
  maxSlots = 5
) => {
  const overlapCount = await orderDetailModel.countDocuments({
    booking_start: { $lt: bookingEnd },
    booking_end: { $gt: bookingStart }
  });

  return overlapCount < maxSlots;
};
