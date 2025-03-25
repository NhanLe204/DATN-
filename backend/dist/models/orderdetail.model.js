import mongoose, { Schema, model } from 'mongoose';
import order from './order.model.js';
import product from './product.model.js';
import service from './service.model.js';
const orderDetailSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: order, required: true },
    productId: { type: Schema.Types.ObjectId, ref: product, required: false, default: '' },
    serviceId: { type: Schema.Types.ObjectId, ref: service, required: false, default: '' },
    quantity: { type: Number, required: true }
}, { timestamps: true });
const orderDetailModel = mongoose.models.orderDetail || model('orderDetail', orderDetailSchema);
export default orderDetailModel;
//# sourceMappingURL=orderdetail.model.js.map