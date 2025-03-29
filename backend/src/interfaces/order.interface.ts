import { ObjectId } from 'mongoose';
import { IUser } from './user.interface.js';
import { OrderStatus, PaymentStatus } from '../enums/order.enum.js';

export interface IOrder {
  userID?: IUser;
  payment_typeID?: ObjectId;
  deliveryID?: ObjectId;
  couponID?: ObjectId;
  order_date: Date;
  total_price: number;
  discount?: number;
  shipping_address: string;
  delivery_name?: string;
  payment_status: PaymentStatus;
  status: OrderStatus;
  transaction_id?: string;
}
