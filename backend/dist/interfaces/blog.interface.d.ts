import { ObjectId } from 'mongoose';
import { IProduct } from './product.interface.js';
import { BlogStatus } from '@/enums/blog.enum.js';
export interface IBlog {
    _id: ObjectId;
    product?: IProduct;
    title: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    status?: BlogStatus;
}
