import { ObjectId } from 'mongoose';

export interface IRating {
  _id: ObjectId;
  orderDetailID: string;
  score: number;
  created_at: Date;
  updated_at: Date;
}
