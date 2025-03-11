import { ObjectId } from 'mongoose';

export interface IService {
  _id: ObjectId;
  service_name: string;
  description?: string;
  service_price: number;
  service_time: Date;
  duration: Date;
  create_at: Date;
  update_at: Date;
}
