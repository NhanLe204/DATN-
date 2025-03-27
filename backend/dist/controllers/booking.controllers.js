import bookingModel from '../models/booking.model.js';
export const createBookingSpa = async (req, res) => {
    try {
        const { userId, serviceId, booking_date, booking_time } = req.body;
        const bookingExist = await bookingModel.findOne({ userId, serviceId, booking_date, booking_time });
        if (bookingExist) {
            res.status(400).json({ message: 'Quý khách đã đặt lịch hẹn này rồi' });
            return;
        }
        const booking = await bookingModel.create(req.body);
        res.status(201).json({ booking });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
//# sourceMappingURL=booking.controllers.js.map