import mongoose, { Schema, model } from 'mongoose';
import { IBlog } from '../interfaces/blog.interface.js';
import { BlogStatus } from '../enums/blog.enum.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

const blogSchema: Schema<IBlog> = new Schema<IBlog>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: Product,
      autoPopulate: true
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: User,
      autoPopulate: true
    },
    image_url: {
      type: [String],
      default: []
    },
    tittle: {
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
  },
  { timestamps: true }
);

const blogModel = mongoose.models.Blog || model<IBlog>('Blog', blogSchema);

export default blogModel;
