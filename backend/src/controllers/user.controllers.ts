import { Request, Response } from 'express';
import userModel from '../models/user.model.js';
import mongoose from 'mongoose';
import { IAddress, IUser } from '../interfaces/user.interface.js';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}
// lấy hết nè má
export const getAllUser = async (req: Request, res: Response) => {
  try {
    const result = await userModel.find().select('-password');
    res.status(200).json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error user up: ${error.message}`);
    } else {
      console.error('Error user up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
// Lấy user theo id nè má
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching user: ${error.message}`);
    } else {
      console.error('Error fetching user:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
// Cập nhật user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(id, 'ID');
    const { email, fullname, phone_number, address, role, avatar, status, dateOfBirth } = req.body;

    // Không bắt buộc tất cả trường, chỉ cần ít nhất một trường để cập nhật

    if (!email && !fullname && !phone_number && !address && !role && !avatar && !status && !dateOfBirth) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ít nhất một thông tin để cập nhật'
      });
      return;
    }

    const updateData: Partial<IUser> = {};
    if (email) updateData.email = email;
    if (fullname) updateData.fullname = fullname;
    if (phone_number) updateData.phone_number = phone_number;
    if (address) updateData.address = address;
    if (role) updateData.role = role;
    if (avatar) updateData.avatar = avatar;
    if (status) updateData.status = status;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedUser) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    res.status(200).json({
      message: 'Người dùng đã được cập nhật thành công',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error user up: ${error.message}`);
    } else {
      console.error('Error user up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { _id } = req.user;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      res.status(400).json({ message: 'Vui lòng cung cấp productId và quantity' });
      return;
    }

    const user = await userModel.findById(_id);
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    console.log(typeof productId, productId, 'productId từ req.body');
    console.log(user.cart, 'Giỏ hàng từ database');

    // Ép productId từ string sang ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // So sánh bằng .equals() để tránh lỗi kiểu dữ liệu
    const alreadyProduct = user.cart.find((item: { product: mongoose.Types.ObjectId; quantity: number }) =>
      item.product.equals(productObjectId)
    );

    console.log(alreadyProduct, 'alreadyProduct');

    if (alreadyProduct) {
      console.log('Đã tìm thấy sản phẩm trong giỏ hàng, cập nhật số lượng');
      alreadyProduct.quantity += quantity;
      await user.save();
      res.status(200).json({ message: 'Cập nhật giỏ hàng thành công', user });
    } else {
      console.log('Sản phẩm chưa có trong giỏ hàng, thêm mới');
      const response = await userModel.findByIdAndUpdate(
        _id,
        { $push: { cart: { product: productObjectId, quantity } } },
        { new: true }
      );
      res.status(200).json({ message: 'Thêm sản phẩm vào giỏ hàng thành công', response });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addUserAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const newAddress: IAddress = req.body;

    // Validate dữ liệu địa chỉ mới
    if (!newAddress || typeof newAddress !== 'object' || !newAddress.name || !newAddress.phone || !newAddress.address) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu địa chỉ không hợp lệ! Yêu cầu các trường name, phone, address.'
      });
      return;
    }

    // Tìm user và thêm địa chỉ mới vào mảng address
    const user = await userModel.findById(id);
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    user.address = user.address || [];
    user.address.push(newAddress);

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Thêm địa chỉ thành công',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error adding address: ${error.message}`);
      res.status(500).json({ success: false, message: `Lỗi server: ${error.message}` });
    } else {
      console.error('Error adding address:', error);
      res.status(500).json({ success: false, message: 'Lỗi server không xác định' });
    }
  }
};
