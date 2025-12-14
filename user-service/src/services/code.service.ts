import { Code } from '../models/code.model';
import { CodeType } from '../enums/codeType.enum';
import { User } from '../models/user.model';
import { generateCode } from '../utils/codeGenerator.util';
import { parseExpiryToSeconds } from '../utils/time.util';

const codeService = {
  // Generate code
  createCode: async (
    userId: number,
    type: CodeType,
    ttlMinutes = process.env.VERIFICATION_CODE_EXPIRES_IN_MINUTES!
  ) => {
    const code = generateCode();
    const expiredAt = new Date(Date.now() + parseExpiryToSeconds(ttlMinutes));

    await Code.create({
      userId,
      code,
      type,
      expiredAt,
    });

    return { code, expiredAt };
  },
  // Verify code
  verifyCode: async (code: string, type: CodeType) => {
    const record = await Code.findOne({
      code,
      type,
      isUsed: false,
      expiredAt: { $gt: new Date() },
    });

    if (!record) throw new Error('Invalid or expired code');

    record.isUsed = true;
    await record.save();

    if (type === CodeType.ACCOUNT_VERIFICATION && record.userId) {
      const user = await User.findOne({ userId: record.userId });
      if (user) {
        user.isVerified = true;
        await user.save();
      } else {
        throw new Error('User not found');
      }
    }

    return { message: 'Code verified successfully' };
  },
};

export default codeService;
