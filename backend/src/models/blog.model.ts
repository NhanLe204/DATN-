import mongoose from 'mongoose';
import { IBlog } from '../interfaces/blog.interface.js';

const blogSchema = new mongoose.Schema<IBlog>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image_url: { type: [String], default: [] },
  author: { type: String, required: true }, 
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
export default mongoose.model<IBlog>('Blog', blogSchema);