import serviceModel from '../models/service.model.js';
import { ServiceStatus } from '@/enums/service.enum.js';
export const createService = async (req, res) => {
    try {
        const { service_name, description, service_price, duration, status } = req.body;
        // Validate dữ liệu đầu vào
        if (!service_name || service_price === undefined || duration === undefined) {
            res
                .status(400)
                .json({ success: false, message: 'Thiếu các trường bắt buộc: service_name, service_price, duration' });
            return;
        }
        // Kiểm tra kiểu dữ liệu
        const price = Number(service_price);
        const dur = Number(duration);
        if (isNaN(price) || price < 0) {
            res.status(400).json({ success: false, message: 'Giá dịch vụ phải là số không âm' });
            return;
        }
        if (isNaN(dur) || dur <= 0) {
            res.status(400).json({ success: false, message: 'Thời lượng phải là số lớn hơn 0' });
            return;
        }
        // Kiểm tra service_name đã tồn tại chưa
        const existingService = await serviceModel.findOne({ service_name });
        if (existingService) {
            res.status(400).json({ success: false, message: 'Dịch vụ đã tồn tại' });
            return;
        }
        const newService = new serviceModel({
            service_name,
            description: description || '',
            service_price: price,
            duration: dur,
            status: status || 'active'
        });
        const savedService = await newService.save();
        res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công', data: savedService });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo dịch vụ', details: errorMessage });
    }
};
export const getAllServices = async (req, res) => {
    try {
        const result = await serviceModel.find();
        res.status(200).json({ success: true, result });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error brand up: ${error.message}`);
            return;
        }
        else {
            console.error('Error brand up:', error);
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
export const getServiceActive = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const services = await serviceModel.find({ status: ServiceStatus.ACTIVE }).skip(skip).limit(limit);
        const total = await serviceModel.countDocuments({ status: ServiceStatus.ACTIVE });
        res.status(200).json({
            success: true,
            data: services,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
// Lấy dịch vụ theo _id (ObjectId của MongoDB)
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy _id từ params
        const { showAll } = req.query;
        const service = await serviceModel.findById(id);
        if (!service) {
            res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ với ID này' });
            return;
        }
        // Kiểm tra status (nếu không có showAll=true)
        if (showAll !== 'true' && service.status !== ServiceStatus.ACTIVE) {
            res.status(404).json({
                success: false,
                message: 'Dịch vụ không hoạt động'
            });
            return;
        }
        res.status(200).json({ success: true, data: service });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
    }
};
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { service_name, description, service_price, duration, status } = req.body;
        const service = await serviceModel.findById(id);
        if (!service) {
            res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
            return;
        }
        // Kiểm tra dữ liệu đầu vào nếu có
        if (service_price !== undefined) {
            const price = Number(service_price);
            if (isNaN(price) || price < 0) {
                res.status(400).json({ success: false, message: 'Giá dịch vụ phải là số không âm' });
                return;
            }
            service.service_price = price;
        }
        if (duration !== undefined) {
            const dur = Number(duration);
            if (isNaN(dur) || dur <= 0) {
                res.status(400).json({ success: false, message: 'Thời lượng phải là số lớn hơn 0' });
                return;
            }
            service.duration = dur;
        }
        if (service_name)
            service.service_name = service_name;
        if (description !== undefined)
            service.description = description;
        if (status && ['active', 'inactive'].includes(status))
            service.status = status;
        const updatedService = await service.save();
        res.status(200).json({ success: true, message: 'Cập nhật dịch vụ thành công', data: updatedService });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật dịch vụ', details: errorMessage });
    }
};
// xóa
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await serviceModel.findById(id);
        if (!service) {
            res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
            return;
        }
        await serviceModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Xóa dịch vụ thành công' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa dịch vụ', details: errorMessage });
    }
};
//# sourceMappingURL=service.controllers.js.map