import { ObjectId } from 'mongoose';

export interface IRating {
  _id: ObjectId;
  orderDetailID: ObjectId;
  score: number;
  created_at: Date;
  updated_at: Date;
}
