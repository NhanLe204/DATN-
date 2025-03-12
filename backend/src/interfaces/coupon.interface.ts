import { CouponStatus } from '../enums/coupon.enum.js';
import { ObjectId } from 'mongoose';

export interface ICoupon {
  _id: ObjectId;
  coupon_code: string;
  discount_value: string;
  min_order_value: string;
  max_discount: string;
  start_date: Date;
  end_date: Date;
  usage_litmit: number;
  used_count: number;
  status: CouponStatus;
}
