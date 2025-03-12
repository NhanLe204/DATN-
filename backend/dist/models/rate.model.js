import mongoose, { Schema, model } from 'mongoose';
import orderDetail from './orderdetail.model.js';
const rateSchema = new Schema({
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
}, { timestamps: true });
const rateModel = mongoose.models.rate || model('rate', rateSchema);
export default rateModel;
//# sourceMappingURL=rate.model.js.map