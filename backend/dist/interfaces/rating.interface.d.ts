import { ObjectId } from 'mongoose';
export interface IRating {
    _id: ObjectId;
    orderDetailId: ObjectId;
    score: number;
    userId: ObjectId;
    productId: ObjectId;
    content: string;
    created_at: Date;
    updated_at: Date;
}
