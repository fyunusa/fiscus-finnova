import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  bankCode!: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  accountHolder!: string;
}

export class BankAccountResponseDto {
  id!: string;
  userId!: string;
  bankCode!: string;
  accountNumber!: string;
  accountHolder!: string;
  status!: string;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
