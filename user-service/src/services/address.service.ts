import { Address } from '../models/address.model';
import { IAddressDoc } from '../models/address.model';
import { User } from '../models/user.model';

const addressService = {
  // Add a new address for the user
  create: async (data: Partial<IAddressDoc>) => {
    if (!data.userId) {
      throw new Error('User ID is required');
    }
    const count = await Address.countDocuments({ userId: data.userId });
    if (count === 0) {
      data.isDefault = true;
    } else if (data.isDefault) {
      await Address.updateMany(
        { userId: data.userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create(data);
    return address;
  },
  // Get all addresses for the user
  listByUser: async (userId: number) => {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  },
  // Update an existing address
  update: async (addressId: number, data: Partial<IAddressDoc>) => {
    const existing = await Address.findOne({ addressId });
    if (!existing) throw new Error('Address not found');
    if (data.isDefault) {
      await Address.updateMany(
        { userId: existing.userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    const updated = await Address.findOneAndUpdate({ addressId }, data, {
      new: true,
    });
    if (!updated) throw new Error('Address not found after update');
    return updated;
  },
  // Delete an address
  delete: async (addressId: number) => {
    const deleted = await Address.findOneAndDelete({ addressId });
    if (!deleted) throw new Error('Address not found');
    if (deleted.isDefault) {
      const latest = await Address.findOne({ userId: deleted.userId }).sort({
        createdAt: -1,
      });
      if (latest) {
        latest.isDefault = true;
        await latest.save();
      }
    }
    return { message: 'Address deleted successfully' };
  },
  // Set an address as the default address for the user
  setDefault: async (userId: number, addressId: number) => {
    await Address.updateMany({ userId }, { isDefault: false });
    const updated = await Address.findOneAndUpdate(
      { userId, addressId },
      { isDefault: true },
      { new: true }
    );
    if (!updated) throw new Error('Address not found');
    return { message: 'Default address set successfully' };
  },
  // Get address by id + user's email
  getByIdWithUserEmail: async (addressId: number) => {
    const address = await Address.findOne({ addressId });
    if (!address) throw new Error('Address not found');

    const user = await User.findOne({ userId: address.userId });
    if (!user) throw new Error('User not found');

    return {
      ...address.toObject(),
      userEmail: user.email,
    };
  },
  getListAddressByEmail: async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const addresses = await Address.find({ userId: user.userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return addresses;
  },
};

export default addressService;
