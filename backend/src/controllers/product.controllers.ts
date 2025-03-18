import { Request, Response } from 'express';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import productModel from '../models/product.model.js';
import { ProductStatus, ProductStatusMapping } from '../enums/product.enum.js';
import categoryModel from '../models/category.model.js';
import tagModel from '../models/tag.model.js';

export const getAllProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel.find().populate('category_id').populate('brand_id').populate('tag_id');
    res.status(200).json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error product up: ${error.message}`);
    } else {
      console.error('Error product up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id).populate('category_id').populate('brand_id').populate('tag_id');
    if (!product) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return;
    }
    res.status(200).json({ message: 'Lấy sản phẩm thành công', product });
  } catch (error) {
    res.status(500).json({ message: 'Error getting product', error });
  }
};
export const insertProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category_id, image_url, tag_id, brand_id, status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      res.status(400).json({ message: 'Invalid category_id' });
      return;
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      category_id,
      image_url,
      tag_id,
      brand_id,
      status
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(id, 'ID');
    const { name, description, price, category_id, image_url, brand_id, status } = req.body;

    if (!name || !description || !price || !category_id || !image_url || !brand_id || !status) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ các trường của sản phẩm'
      });
      return;
    }
    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái sản phẩm không hợp lệ' });
      return;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { name, description, price, category_id, image_url, brand_id, status },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return;
    }

    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error product up: ${error.message}`);
    } else {
      console.error('Error product up:', error);
    }
  }
};
export const toggleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log('ID Product:', id);
    console.log('Status Product:', status);

    if (!id) {
      res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
      return;
    }

    if (!status || typeof status !== 'string' || !(status.toUpperCase() in ProductStatusMapping)) {
      res.status(400).json({ message: 'Trạng thái sản phẩm không hợp lệ' });
      return;
    }

    const mappedStatus = ProductStatusMapping[status as keyof typeof ProductStatusMapping];

    const product = await productModel.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      return;
    }

    product.status = mappedStatus;
    await product.save();

    res.status(200).json({
      message: `Trạng thái sản phẩm đã được cập nhật thành công: ${mappedStatus}`,
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error });
  }
};

export const getNewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('category_id')
      .populate('brand_id');

    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm mới' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm mới thành công', products: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm mới', error });
  }
};

export const getSaleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find({ discount: { $gt: 0 } })
      .populate('category_id')
      .populate('brand_id')
      .limit(10);
    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm giảm giá' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm giảm giá thành công', products: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm giảm giá', error });
  }
};

export const getHotProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find()
      .sort({ quantity_sold: -1 })
      .limit(10)
      .populate('category_id')
      .populate('brand_id');

    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm bán chạy' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm bán chạy thành công', products: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm bán chạy', error });
  }
};

export const getProductByCategoryID = async (req: Request, res: Response): Promise<void> => {
  let categoryName = 'category'; // Giá trị mặc định nếu không lấy được name

  try {
    const { id } = req.params;
    console.log('Received category ID:', id); // Log để kiểm tra

    // Kiểm tra id có tồn tại không
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
      return;
    }

    // Kiểm tra tính hợp lệ của id
    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
      return;
    }

    // Parse id thành ObjectId
    const categoryId = new ObjectId(id);
    console.log('Parsed ObjectId:', categoryId); // Log để kiểm tra

    // Lấy thông tin category để lấy name
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`
      });
      return;
    }

    categoryName = category.name || 'category'; // Lấy name của category, mặc định là 'category' nếu không có
    console.log('Category name:', categoryName); // Log để kiểm tra

    // Query sản phẩm
    const result = await productModel.find({ category_id: categoryId });
    console.log('Query result:', result); // Log để kiểm tra

    // Kiểm tra kết quả
    if (!result || result.length === 0) {
      res.status(404).json({
        success: false,
        message: `No products found for category "${categoryName}" (ID: ${id})`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Lấy sản phẩm dành cho ${categoryName} thành công`,
      products: result
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy sản phẩm dành cho ${categoryName}`
    });
  }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  console.log('Received files:', req.files); // Debug
  if (!req.files) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  res.status(200).json({ message: 'Upload images successfully', files: req.files });
};

export const getProductActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel.find({ status: ProductStatus.AVAILABLE });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

export const getProductByTagId = async (req: Request, res: Response): Promise<void> => {
  let tagName = 'tag';
  try {
    const { id } = req.params;
    console.log('Received tag_id ID:', id);

    // Kiểm tra id có tồn tại không
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Tag ID is required'
      });
      return;
    }

    // Kiểm tra tính hợp lệ của id
    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid Tag ID format'
      });
      return;
    }

    // Parse id thành ObjectId
    const tagId = new ObjectId(id);
    console.log('Parsed ObjectId:', tagId); // Log để kiểm tra

    // Lấy thông tin category để lấy name
    const tag = await tagModel.findById(tagId);
    if (!tag) {
      res.status(404).json({
        success: false,
        message: `Tag with ID ${id} not found`
      });
      return;
    }

    tagName = tag.tag_name || 'TAG';
    console.log('Category name:', tagName); // Log để kiểm tra

    // Query sản phẩm
    const result = await productModel.find({ tag_id: tagId });
    console.log('Query result:', result); // Log để kiểm tra

    // Kiểm tra kết quả
    if (!result || result.length === 0) {
      res.status(404).json({
        success: false,
        message: `No products found for tag "${tagName}" (ID: ${id})`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Lấy sản phẩm dành cho "${tagName}" thành công`,
      products: result
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy sản phẩm dành cho ${tagName}`
    });
  }
};
