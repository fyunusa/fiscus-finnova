import { IsString, Length, Matches } from 'class-validator';

export class SetTransactionPINDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 digits' })
  pin!: string;
}

export class TransactionPINResponseDto {
  id!: string;
  userId!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
