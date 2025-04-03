import mongoose, { Schema, model } from 'mongoose';
import { BlogStatus } from '../enums/blog.enum.js';
import Product from '../models/product.model.js';
const blogSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: Product,
        autoPopulate: true
    },
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: User,
    //   autoPopulate: true
    // },
    // image_url: {
    //   type: [String],
    //   default: []
    // },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: BlogStatus,
        default: BlogStatus.ACTIVE
    }
}, { timestamps: true });
const blogModel = mongoose.models.Blog || model('Blog', blogSchema);
export default blogModel;
//# sourceMappingURL=blog.model.js.map