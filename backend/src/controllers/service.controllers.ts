import { Request, Response } from 'express';
import { CategoryStatus } from '../enums/category.enum.js';
import mongoose from 'mongoose';
import brandModel from '../models/brand.model.js';
import { IService } from '../interfaces/service.interface.js';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
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
