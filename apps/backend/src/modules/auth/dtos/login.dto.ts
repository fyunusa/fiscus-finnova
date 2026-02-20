import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Login request
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;
}

// Login response
export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({
    example: {
      id: 'user-id',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'individual',
      role: 'user',
      hasVerifiedBankAccount: true,
      hasKYCDocument: true,
      hasTransactionPIN: false,
    },
  })
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    role: string;
    hasVerifiedBankAccount: boolean;
    hasKYCDocument: boolean;
    hasTransactionPIN: boolean;
  };
}

// Refresh token request
export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

// Forgot password request
export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}

// Reset password request
export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'reset_token_from_email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

// Verify password reset code
export class VerifyPasswordResetCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code!: string;
}

// Change password
export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
