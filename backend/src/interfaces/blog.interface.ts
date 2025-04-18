import { ObjectId } from 'mongoose';
import { BlogStatus } from '../enums/blog.enum.js';
import { IBlogCategory } from './blogCategory.interface.js';
export interface IBlog {
  _id: ObjectId;
  blog_category_id: IBlogCategory;
  image_url?: string;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  status?: BlogStatus;
}
