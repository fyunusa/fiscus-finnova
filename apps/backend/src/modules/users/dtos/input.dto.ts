import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserType } from '../enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ enum: UserType, example: UserType.INDIVIDUAL, default: UserType.INDIVIDUAL })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;
}
