// src/models/Contact.ts
import mongoose, { Schema } from 'mongoose';
const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
export default mongoose.model('Contact', contactSchema);
//# sourceMappingURL=contact.model.js.map