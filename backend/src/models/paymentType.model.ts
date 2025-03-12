import { IPaymentType } from '@/interfaces/paymentType.interface.js';
import { Request, Response } from 'express';
import mongoose, { Schema } from 'mongoose';

const paymentTypeSchema: Schema<IPaymentType> = new Schema<IPaymentType>(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    payment_type_name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const PaymentType = mongoose.models.paymentType || mongoose.model('paymentType', paymentTypeSchema);
export default PaymentType;
