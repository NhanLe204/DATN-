import { Request, Response } from 'express';
import mongoose from 'mongoose';
import brandModel from '../models/brand.model.js';
import { IBrand } from '../interfaces/brand.interface.js';
import productModel from '@/models/product.model.js';
interface AuthenticatedRequest extends Request {
  brand?: IBrand;
}

export const getAllBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await brandModel.find();
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

export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await brandModel.findById(id);
    if (!brand) {
      res.status(404).json({ message: 'Không tìm thấy thương hiệu của sản phẩm' });
      return;
    }
    res.status(200).json({ message: 'Lấy thương hiệu sản phẩm thành công', brand });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error brand up: ${error.message}`);
      return;
    } else {
      console.error('Error brand up:', error);
      return;
    }
  }
};
export const insertBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brand_name } = req.body;
    if (!brand_name) {
      res.status(400).json({
        success: false,
        message: 'Please provide an brand name'
      });
    }
    const existingNameBrand = await brandModel.findOne({ brand_name });
    if (existingNameBrand) {
      res.status(400).json({
        success: false,
        message: 'Brand with this name already exists'
      });
    }
    const newBrand = new brandModel({
      brand_name
    });

    await newBrand.save();

    res.status(201).json({
      success: true,
      user: { ...newBrand._doc }
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error brand up: ${error.message}`);
    } else {
      console.error('Error brand up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
      return;
    }

    const brand = await brandModel.findById(id);
    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy brand'
      });
      return;
    }

    const hasProducts = await productModel.exists({
      brand_id: id,
      status: "available"
    });

    if (hasProducts) {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa brand vì đang có sản phẩm sử dụng!'
      });
      return;
    }

    await brandModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Đã xóa brand thành công'
    });
    return;

  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
    return;
  }
};


export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID không hợp lệ'
      });
      return;
    }
    const { brand_name } = req.body;
    // Tìm và cập nhật tên thương hiệu
    const updatedCategory = await brandModel.findByIdAndUpdate(id, { brand_name }, { new: true, runValidators: true });

    if (!updatedCategory) {
      res.status(404).json({ success: false, message: 'Tên thương hiệu không tồn tại' });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: 'Tên thương hiệu được cập nhật thành công', newBrand: updatedCategory });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi cập nhật thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    } else {
      console.error('Lỗi không xác định khi cập nhật thương hiệu:', error);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
  }
};
