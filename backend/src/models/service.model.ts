import mongoose, { Schema, model } from 'mongoose';
import { IService } from '../interfaces/service.interface.js';

const serviceSchema: Schema<IService> = new Schema<IService>(
  {
    service_name: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    service_price: { type: Number, required: true, default: 0 },
    service_time: { type: Date, required: true },
    duration: { type: Date, required: true }
  },
  { timestamps: true }
);

// const ServiceModel = mongoose.model.service('Service', serviceSchema);
const ServiceModel = mongoose.models.service || model('service', serviceSchema);

export default ServiceModel;
