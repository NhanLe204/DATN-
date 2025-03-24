import { Request, Response } from 'express';
import { CategoryStatus } from '../enums/category.enum.js';
import mongoose from 'mongoose';
import brandModel from '../models/brand.model.js';
import { IService } from '../interfaces/service.interface.js';
import serviceModel from '../models/service.model.js';
import { ServiceStatus } from '@/enums/service.enum.js';

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { service_name, description, duration, status } = req.body;

    // Validate dữ liệu đầu vào
    if (!service_name || !description || !duration || !status) {
      res.status(400).json({ success: false, message: 'Thiếu các trường bắt buộc' });
      return;
    }

    // Kiểm tra xem serviceID đã tồn tại chưa
    const existingService = await serviceModel.findOne({ service_name });
    if (existingService) {
      res.status(400).json({ success: false, message: 'service đã tồn tại' });
      return;
    }

    // Tạo mới dịch vụ
    const newService = new serviceModel({
      service_name,
      description,
      duration,
      status
    });

    // Lưu vào database
    const savedService = await newService.save();

    res.status(201).json({ success: true, message: 'Tạo dịch vụ thành công', data: savedService });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await serviceModel.find();
    res.status(200).json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error brand up: ${error.message}`);
      return;
    } else {
      console.error('Error brand up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const getServiceActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};
// Lấy dịch vụ theo _id (ObjectId của MongoDB)
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Lấy serviceID từ params
    const { service_name, description, service_price, duration, status } = req.body;
		
    // Kiểm tra xem dịch vụ có tồn tại không
    const service = await serviceModel.findById(id);
    if (!service) {
      res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ với serviceID này' });
      return;
    }

    // Kiểm tra dữ liệu đầu vào
    if (service_price !== undefined && service_price < 0) {
      res.status(400).json({ success: false, message: 'Giá dịch vụ không được âm' });
      return;
    }
    if (duration !== undefined && duration <= 0) {
      res.status(400).json({ success: false, message: 'Thời lượng phải lớn hơn 0' });
      return;
    }
    if (status && !Object.values(ServiceStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      return;
    }

    // Cập nhật các trường (chỉ cập nhật nếu có giá trị trong body)
    if (service_name) service.service_name = service_name;
    if (description) service.description = description;
    if (service_price !== undefined) service.service_price = service_price;
    if (duration !== undefined) service.duration = duration;
    if (status) service.status = status;

    // Lưu thay đổi
    const updatedService = await service.save();

    res.status(200).json({ success: true, message: 'Cập nhật dịch vụ thành công', data: updatedService });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Internal Server Error', details: errorMessage });
  }
};
