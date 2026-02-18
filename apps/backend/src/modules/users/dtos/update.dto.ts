import { IsEmail, IsOptional, MinLength, IsEnum, IsPhoneNumber } from 'class-validator';
import { UserType, UserStatus } from '../enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInputDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123', required: false })
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ enum: UserType, required: false })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  emailVerified?: boolean;
}
