export interface IAddress {
  addressId: number;
  userId: number;
  fullName: string;
  phone: string;
  detailAddress: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  isDefault: boolean;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
