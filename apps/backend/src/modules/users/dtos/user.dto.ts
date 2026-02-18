import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsEnum(['individual', 'corporate'])
  userType!: 'individual' | 'corporate';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';
}

export class UserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  phoneNumber?: string;
  userType!: 'individual' | 'corporate';
  status!: 'active' | 'inactive' | 'suspended';
  emailVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
