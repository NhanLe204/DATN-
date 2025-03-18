import { Request, Response } from 'express';
import { CategoryStatus } from '../enums/category.enum.js';
import mongoose from 'mongoose';
import tagModel from '../models/tag.model.js';

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await tagModel.find();
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
export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tag = await tagModel.findById(id);
    if (!tag) {
      res.status(404).json({ message: 'Tag name này không tồn tại' });
      return;
    }
    res.status(200).json({ message: 'Lấy tag name của sản phẩm thành công', tag });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error tag up: ${error.message}`);
      return;
    } else {
      console.error('Error tag up:', error);
      return;
    }
  }
};
export const insertTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag_name } = req.body;
    if (!tag_name) {
      res.status(400).json({
        success: false,
        message: 'Please provide an tag name'
      });
    }
    const existingNameBrand = await tagModel.findOne({ tag_name });
    if (existingNameBrand) {
      res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }
    const newTag = new tagModel({
      tag_name
    });

    await newTag.save();

    res.status(201).json({
      success: true,
      tag: { ...newTag._doc }
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error tag up: ${error.message}`);
    } else {
      console.error('Error tag up:', error);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await tagModel.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};
