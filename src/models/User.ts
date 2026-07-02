import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    walletBalance: {
      type: Number,
      required: true,
      default: 10000,
      min: 0,
    },
  },
  { timestamps: true },
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", userSchema);

export default User;
