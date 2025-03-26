import mongoose, { Schema, model } from 'mongoose';
import { UserRoles, UserStatus } from '../enums/user.enum.js';
import { IUser } from '../interfaces/user.interface.js';
import product from './product.model.js';

const addressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true } // Chuỗi địa chỉ đầy đủ
});

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    googleId: {
      type: String,
      require: false
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: ''
    },
    fullname: {
      type: String,
      required: false,
      default: ''
    },
    password: {
      type: String,
      required: false
    },
    phone_number: {
      type: String,
      default: ''
    },
    address: {
      type: [addressSchema],
      default: []
    },
    status: {
      type: String,
      default: UserStatus.PENDING
    },
    role: {
      type: String,
      default: UserRoles.USER
    },
    avatar: {
      type: String
    },
    cart: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: product,
            required: true
          },
          quantity: { type: Number, default: 1 }
        }
      ],
      default: []
    },
    reset_password_token: {
      type: String,
      default: ''
    },
    reset_password_expires: {
      type: Date,
      default: null
    },
    refreshToken: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    otp: {
      type: String,
      default: null
    },
    otpExpiry: {
      type: Date,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || model('user', userSchema);

export default userModel;
