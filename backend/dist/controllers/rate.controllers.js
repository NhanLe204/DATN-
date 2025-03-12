import rateModel from '../models/rate.model.js';
export const getAllRatings = async (req, res) => {
    try {
        // .populate('orderDetailID');
        const ratings = await rateModel.find();
        res.status(200).json({ success: true, data: ratings });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách rating', error });
    }
};
export const getRatingID = async (req, res) => {
    try {
        const { id } = req.params;
        // .populate('orderDetailID');
        const rate = await rateModel.findById(id);
        // .populate('orderDetailID');
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
            return;
        }
        res.status(200).json({ success: true, data: rate });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching rate: ${error.message}`);
        }
        else {
            console.error('Error fetching rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
export const createRating = async (req, res) => {
    try {
        const { orderDetailID, score } = req.body;
        console.log(orderDetailID, score);
        const newRating = await rateModel.create({ orderDetailID, score });
        res.status(201).json(newRating);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to create rating', details: errorMessage });
    }
};
export const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;
        const rate = await rateModel.findByIdAndUpdate(id, { score }, { new: true });
        // .populate('orderDetailID');
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá để cập nhật' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật đánh giá thành công',
            data: rate
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating rate: ${error.message}`);
        }
        else {
            console.error('Error updating rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
export const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const rate = await rateModel.findByIdAndDelete(id);
        if (!rate) {
            res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá để xóa' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Xóa đánh giá thành công'
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting rate: ${error.message}`);
        }
        else {
            console.error('Error deleting rate:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
//# sourceMappingURL=rate.controllers.js.map