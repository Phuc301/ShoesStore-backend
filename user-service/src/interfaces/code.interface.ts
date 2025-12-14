import { CodeType } from '../enums/codeType.enum';

export interface ICode {
  codeId: number;
  userId: number;
  code: string;
  type: CodeType;
  isUsed: boolean;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
