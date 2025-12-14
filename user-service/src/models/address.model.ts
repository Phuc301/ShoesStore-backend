import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from '../interfaces/address.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';

export interface IAddressDoc extends IAddress, Document {}

const addressSchema = new Schema<IAddressDoc>(
  {
    addressId: { type: Number, unique: true },
    userId: { type: Number, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    detailAddress: { type: String, required: true },
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    provinceCode: { type: String, required: true },
    districtCode: { type: String, required: true },
    wardCode: { type: String, required: true },
    country: { type: String, required: false },
    isDefault: { type: Boolean, default: false },
    type: { type: String, required: false },
  },
  { timestamps: true }
);

addressSchema.pre('save', async function (next) {
  if (!this.addressId) {
    this.addressId = await getNextSequence(DB_COLLECTIONS.ADDRESSES);
  }
  next();
});

export const Address = mongoose.model<IAddressDoc>(
  DB_COLLECTIONS.ADDRESSES,
  addressSchema
);
