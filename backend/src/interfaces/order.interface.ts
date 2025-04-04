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
  shipping_address: string;
  payment_status: PaymentStatus;
  paymentOrderCode: number;
  status: OrderStatus;
}
