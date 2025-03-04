import mongoose, { Schema, model } from 'mongoose';
const brandSchema = new Schema({
    brand_name: {
        type: String,
        default: ''
    }
});
const brandModel = mongoose.models.brand || model('brand', brandSchema);
export default brandModel;
//# sourceMappingURL=brand.model.js.map