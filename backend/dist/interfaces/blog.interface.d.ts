import { ObjectId } from 'mongoose';
import { IUser } from './user.interface.js';
import { IProduct } from './product.interface.js';
import { BlogStatus } from '../enums/blog.enum.js';
export interface IBlog {
    _id: ObjectId;
    product?: IProduct;
    userID?: IUser;
    image_url?: string[];
    tittle: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    status?: BlogStatus;
}
