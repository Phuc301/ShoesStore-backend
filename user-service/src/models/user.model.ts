import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { UserRole } from '../enums/userRole.enum';
import { AuthProvider } from '../enums/authProvider.enum';

export interface IUserDoc extends IUser, Document {}

const userSchema = new Schema<IUserDoc>(
  {
    userId: { type: Number, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    socialProvider: { type: String, enum: Object.values(AuthProvider) },
    socialId: { type: String },
    avatarUrl: { type: String, default: null },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    sex: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    loyaltyPoints: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isRegistered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.userId) {
    this.userId = await getNextSequence(DB_COLLECTIONS.USERS);
  }
  next();
});

export const User = mongoose.model<IUserDoc>(DB_COLLECTIONS.USERS, userSchema);
