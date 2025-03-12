import mongoose, { Schema, model } from 'mongoose';
import { DeliveryStatus } from '../enums/delivery.enum.js';
const deliverySchema = new Schema({
    delivery_name: { type: String, required: true },
    description: { type: String, default: '' },
    delivery_fee: { type: Number, required: true, default: 0 },
    estimated_delivery_time: { type: Date }, // Corrected typo here
    status: { type: String, enum: DeliveryStatus, default: DeliveryStatus.PENDING }
}, { timestamps: true });
const deliveryModel = mongoose.models.delivery || model('delivery', deliverySchema);
export default deliveryModel;
//# sourceMappingURL=delivery.model.js.map