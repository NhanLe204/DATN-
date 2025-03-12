import mongoose, { Schema, model } from 'mongoose';
import { IRating } from '../interfaces/rate.interface.js';
import orderDetail from './orderdetail.model.js';

const rateSchema: Schema<IRating> = new Schema<IRating>(
  {
    orderDetailID: {
      // type: Schema.Types.ObjectId,
      type: String,
      ref: orderDetail,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);

const rateModel = mongoose.models.rate || model('rate', rateSchema);

export default rateModel;
