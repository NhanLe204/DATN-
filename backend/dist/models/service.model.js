import mongoose, { Schema, model } from 'mongoose';
import { ServiceStatus } from '../enums/service.enum.js';
const serviceSchema = new Schema({
    service_name: { type: String, required: true, default: '' },
    description: { type: String, default: '' },
    service_price: { type: Number, required: true, default: 0 },
    duration: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: Object.values(ServiceStatus).filter((value) => typeof value === 'string'), // Lấy các giá trị của enum
        default: ServiceStatus.ACTIVE // Dùng giá trị từ enum
    }
}, { timestamps: true });
const ServiceModel = mongoose.models.Service || model('Service', serviceSchema);
export default ServiceModel;
//# sourceMappingURL=service.model.js.map