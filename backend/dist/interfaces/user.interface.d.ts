import { UserRoles, UserStatus } from '../enums/user.enum.js';
import { IProduct } from './product.interface.js';
import { Document } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    googleId: string | undefined;
    email: string;
    fullname: string;
    password: string | undefined;
    phone_number: string;
    address: string;
    status: UserStatus;
    role: UserRoles;
    avatar: string;
    cart: IProduct[];
    reset_password_token: string;
    reset_password_expires: Date | null;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}
