import mongoose, { Schema, model } from 'mongoose';
import { BlogStatus } from '../enums/blog.enum.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image_url: { type: [String], default: [] },
    author: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: Product, required: true },
    user: { type: Schema.Types.ObjectId, ref: User, required: true },
    status: {
        type: String,
        enum: BlogStatus,
        default: BlogStatus.ACTIVE
    }
}, { timestamps: true });
const blogModel = mongoose.models.Blog || model('Blog', blogSchema);
export default blogModel;
//# sourceMappingURL=blog.model.js.map