import { AuthProvider } from '../enums/authProvider.enum';
import { UserRole } from '../enums/userRole.enum';

export interface IUser {
  userId: number;
  fullName: string;
  email: string;
  passwordHash?: string;
  socialProvider?: AuthProvider | null;
  socialId?: string;
  avatarUrl?: string;
  role: UserRole;
  loyaltyPoints: number;
  isVerified: boolean;
  isActive: boolean;
  isRegistered: boolean;
  sex?: string | null;
  dateOfBirth?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
