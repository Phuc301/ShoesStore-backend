import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Code } from '../models/code.model';
import { CodeType } from '../enums/codeType.enum';
import { UserRole } from '../enums/userRole.enum';
import { redisClient, redisPublisher } from '../core/redis.core';
import { parseExpiryToSeconds } from '../utils/time.util';
import { generateCode } from '../utils/codeGenerator.util';
import { log } from 'console';
import { RedisEvent } from '../enums/redisEvent.enum';
import { AuthProvider } from '../enums/authProvider.enum';
import { IAddress } from '../interfaces/address.interface';
import addressService from './address.service';
import { IUser } from '../interfaces/user.interface';
const _issueAccountVerificationCode = async (
  user: InstanceType<typeof User>,
  email: string,
  type: CodeType
) => {
  //  Generate code
  const code = generateCode();
  const expiresInSeconds = parseExpiryToSeconds(
    process.env.VERIFICATION_CODE_EXPIRES_IN_MINUTES!
  );
  const expiredAt = new Date(Date.now() + expiresInSeconds);
  // Save to DB
  await Code.create({
    userId: user.userId,
    code,
    type,
    expiredAt,
  });
  // Send email
  const verificationUrl = `${process.env.API_GATEWAY_URL}/api/codes/verify?code=${code}&type=${type}`;
  await redisPublisher.publish(
    RedisEvent.EMAIL_NOTIFICATION,
    JSON.stringify({
      body: {
        to: email,
        verificationUrl,
        purpose: type,
      },
    })
  );
};

const authService = {
  // Register
  register: async (
    fullName: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    let user = await User.findOne({ email });

    if (user && user.isRegistered) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (user && !user.isRegistered) {
      user.fullName = fullName;
      user.passwordHash = passwordHash;
      user.isRegistered = true;
      await user.save();
    } else {
      user = await User.create({
        fullName,
        email,
        passwordHash,
        role,
        isRegistered: true,
      });
    }

    if (!user) throw new Error('User not found');
    await _issueAccountVerificationCode(
      user,
      email,
      CodeType.ACCOUNT_VERIFICATION
    );

    return {
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  },
  // Login
  login: async (email: string, password: string) => {
    const user = await User.findOne({ email, isRegistered: true });
    if (!user) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, user.passwordHash || '');
    if (!match) throw new Error('Password is incorrect');

    const accessExpiry = process.env
      .ACCESS_TOKEN_EXPIRY! as SignOptions['expiresIn'];
    const refreshExpiry = process.env
      .REFRESH_TOKEN_EXPIRY! as SignOptions['expiresIn'];

    const accessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: refreshExpiry }
    );

    await redisClient.set(
      `refreshToken:${refreshToken}`,
      user.userId.toString(),
      'EX',
      parseExpiryToSeconds(process.env.REFRESH_TOKEN_EXPIRY!)
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isActive: user.isActive,
        isRegistered: user.isRegistered,
        createdAt: user.createdAt,
        sex: user.sex,
        dateOfBirth: user.dateOfBirth,
        hasPassword: !!user.passwordHash,
      },
    };
  },
  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const userId = await redisClient.get(`refreshToken:${refreshToken}`);
    if (!userId) throw new Error('Refresh token expired or invalid');

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const user = await User.findOne({ userId: decoded.userId });
    if (!user) throw new Error('User not found');

    const accessExpiry = process.env
      .ACCESS_TOKEN_EXPIRY! as SignOptions['expiresIn'];
    const refreshExpiry = process.env
      .REFRESH_TOKEN_EXPIRY! as SignOptions['expiresIn'];

    const newAccessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: accessExpiry }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: refreshExpiry }
    );

    await redisClient.del(`refreshToken:${refreshToken}`);
    await redisClient.set(
      `refreshToken:${newRefreshToken}`,
      user.userId.toString(),
      'EX',
      parseExpiryToSeconds(process.env.REFRESH_TOKEN_EXPIRY!)
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
  // Change password
  changePassword: async (
    userId: number,
    oldPassword: string,
    newPassword: string
  ) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash || '');
    if (!isMatch) throw new Error('Old password is incorrect');

    if (oldPassword === newPassword)
      throw new Error('New password must be different');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  },
  // Reset password
  resetPassword: async (email: string, newPassword: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
  },
  // Logout
  logout: async (accessToken: string, refreshToken: string) => {
    await redisClient.del(`refreshToken:${refreshToken}`);

    try {
      const decoded: any = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;
        if (ttl > 0) {
          await redisClient.set(`blacklist:${accessToken}`, 'true', 'EX', ttl);
        }
      }
    } catch (err) {
      log('Error decoding access token for blacklist:', err);
    }
    return { message: 'Logged out successfully' };
  },
  // Check and create guest account
  findOrRegisterGuest: async (
    guestInfo: Partial<IUser>,
    addressInfo?: Partial<IAddress>
  ) => {
    let user = await User.findOne({ email: guestInfo.email });
    let address = null;
    if (!user) {
      user = await User.create({
        fullName: guestInfo.fullName,
        email: guestInfo.email,
        sex: guestInfo.sex,
        dateOfBirth: guestInfo.dateOfBirth,
        isRegistered: false,
        isVerified: false,
        isActive: true,
      });
    }
    if (addressInfo) {
      address = await addressService.create({
        ...addressInfo,
        userId: user.userId,
      });
    }
    return { user, address };
  },
  // Login with google
  loginWithGoogle: async (profile: any) => {
    let user = await User.findOne({
      socialProvider: AuthProvider.GOOGLE,
      socialId: profile.id,
    });
    // Check if user exists in the database
    if (!user) {
      const email = profile.emails?.[0]?.value;
      if (email) {
        let existingUser = await User.findOne({ email });

        if (existingUser) {
          existingUser.socialProvider = AuthProvider.GOOGLE;
          existingUser.socialId = profile.id;
          existingUser.isRegistered = true;
          existingUser.isActive = true;
          existingUser.isVerified = true;
          await existingUser.save();
          // if (!existingUser.isVerified) {
          //   await _issueAccountVerificationCode(
          //     existingUser,
          //     email,
          //     CodeType.ACCOUNT_VERIFICATION
          //   );
          // }
          user = existingUser;
        } else {
          user = await User.create({
            fullName: profile.displayName,
            email,
            socialProvider: AuthProvider.GOOGLE,
            socialId: profile.id,
            isRegistered: true,
            isVerified: true,
            isActive: true,
          });
          if (!user) throw new Error('User not found');
          // await _issueAccountVerificationCode(
          //   user,
          //   email,
          //   CodeType.ACCOUNT_VERIFICATION
          // );
        }
      }
    }
    // Make sure user exists
    if (!user) {
      throw new Error('User not found');
    }
    // Generate tokens
    const accessExpiry = process.env
      .ACCESS_TOKEN_EXPIRY! as SignOptions['expiresIn'];
    const refreshExpiry = process.env
      .REFRESH_TOKEN_EXPIRY! as SignOptions['expiresIn'];

    const accessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: refreshExpiry }
    );

    await redisClient.set(
      `refreshToken:${refreshToken}`,
      user.userId.toString(),
      'EX',
      parseExpiryToSeconds(process.env.REFRESH_TOKEN_EXPIRY!)
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        hasPassword: !!user.passwordHash,
      },
    };
  },
  //  Update password for OAuth users
  setPasswordForSocialLogin: async (userId: number, newPassword: string) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
  },
  // Send mail reset password
  sendResetPasswordCode: async (email: string) => {
    const user = await User.findOne({
      email,
      isRegistered: true,
      isActive: true,
    });
    if (!user) throw new Error('User not found');
    const code = generateCode();
    const expiresInSeconds = parseExpiryToSeconds(
      process.env.VERIFICATION_CODE_EXPIRES_IN_MINUTES!
    );
    const expiredAt = new Date(Date.now() + expiresInSeconds);
    await Code.create({
      userId: user.userId,
      code,
      type: CodeType.RESET_PASSWORD,
      expiredAt,
    });
    await redisPublisher.publish(
      RedisEvent.EMAIL_NOTIFICATION,
      JSON.stringify({
        body: {
          to: user.email,
          content: code,
          purpose: CodeType.RESET_PASSWORD,
        },
      })
    );
  },
};

export default authService;
