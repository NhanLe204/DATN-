import mongoose, { Schema } from 'mongoose';
const paymentTypeSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    payment_type_name: {
        type: String,
        required: true
    }
}, { timestamps: true });
const PaymentType = mongoose.models.paymentType || mongoose.model('paymentType', paymentTypeSchema);
export default PaymentType;
//# sourceMappingURL=paymentType.model.js.map