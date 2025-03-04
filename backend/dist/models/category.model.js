import mongoose, { Schema, model } from 'mongoose';
import { CategoryStatus } from '../enums/category.enum.js';
const categorySchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: CategoryStatus,
        default: CategoryStatus.ACTIVE
    }
});
const categoryModel = mongoose.models.category || model('category', categorySchema);
export default categoryModel;
//# sourceMappingURL=category.model.js.map