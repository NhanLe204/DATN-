import mongoose, { Schema, model } from 'mongoose';
import user from '../models/user.model.js';
import { PaymentStatus } from '../enums/order.enum.js';
import paymentType from '../models/paymentType.model.js';
import delivery from './delivery.model.js';
import coupon from '../models/coupon.model.js';
const orderSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: user, required: true },
    payment_typeID: { type: Schema.Types.ObjectId, ref: paymentType, default: null },
    deliveryID: { type: Schema.Types.ObjectId, ref: delivery, default: null },
    couponID: { type: Schema.Types.ObjectId, ref: coupon, default: null },
    order_date: { type: Date, default: Date.now },
    total_price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping_address: { type: String, required: true },
    delivery_name: { type: String, default: '' },
    payment_status: {
        type: String,
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    },
    transaction_id: { type: String, default: '' },
    booking_date: { type: Date, default: null }
}, { timestamps: true });
const orderModel = mongoose.models.Order || model('Order', orderSchema);
export default orderModel;
//# sourceMappingURL=order.model.js.map