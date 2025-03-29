import orderDetailModel from '../models/orderdetail.model.js';
// Lấy danh sách tất cả order details
export const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await orderDetailModel.find();
        res.status(200).json({ success: true, data: orderDetails });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order details', error });
    }
};
// Lấy order details theo orderId
export const getOrderDetailsByOrderId = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving order details', error });
    }
};
// Tạo order detail mới
export const createOrderDetail = async (req, res) => {
    try {
        const { orderId, productId, serviceId, quantity, product_price, total_price, booking_date } = req.body;
        if (!orderId || (!productId && !serviceId) || !quantity || !product_price) {
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
            booking_time: serviceId ? booking_date : null
        });
        const savedOrderDetail = await orderDetail.save();
        res.status(201).json({ success: true, message: 'Order detail created successfully', data: savedOrderDetail });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order detail', error });
    }
};
// Cập nhật order detail theo ID
export const updateOrderDetail = async (req, res) => {
    try {
        const updatedOrderDetail = await orderDetailModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrderDetail) {
            return res.status(404).json({ success: false, message: 'Order detail not found' });
        }
        res.status(200).json({ success: true, message: 'Order detail updated successfully', data: updatedOrderDetail });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating order detail', error });
    }
};
// Xóa order detail theo ID
export const deleteOrderDetail = async (req, res) => {
    try {
        const deletedOrderDetail = await orderDetailModel.findByIdAndDelete(req.params.id);
        if (!deletedOrderDetail) {
            return res.status(404).json({ success: false, message: 'Order detail not found' });
        }
        res.status(200).json({ success: true, message: 'Order detail deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting order detail', error });
    }
};
//# sourceMappingURL=orderDetail.controllers.js.map