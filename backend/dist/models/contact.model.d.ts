import mongoose, { Document } from 'mongoose';
interface IContact extends Document {
    name: string;
    email: string;
    phone: string;
    message: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IContact, {}, {}, {}, any>;
export default _default;
