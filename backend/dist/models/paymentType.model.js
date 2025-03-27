import mongoose, { Schema } from 'mongoose';
const paymentTypeSchema = new Schema({
    payment_type_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ''
    }
}, { timestamps: true });
const PaymentType = mongoose.models.paymentType || mongoose.model('paymentType', paymentTypeSchema);
export default PaymentType;
//# sourceMappingURL=paymentType.model.js.map