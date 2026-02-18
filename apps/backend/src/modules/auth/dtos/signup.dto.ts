import { IsEmail, IsString, MinLength, IsPhoneNumber, IsOptional, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../users/enums/user.enum';

// Email verification
export class VerifyEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code!: string;
}

// SMS verification
export class VerifySmsDto {
  @ApiProperty({ example: '+821012345678' })
  @IsPhoneNumber()
  phoneNumber!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code!: string;
}


// Step 4: Identity verification
export class SignupVerifyIdentityDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'encrypted_data_from_nice' })
  @IsString()
  encryptedData!: string;

  @ApiProperty({ example: 'integrity_value_from_nice' })
  @IsString()
  integrityValue!: string;
}

// Signup response with temporary token for multi-step form
export class SignupStepResponseDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: UserType.INDIVIDUAL, enum: UserType })
  userType!: UserType;

  @ApiProperty({ example: 'step_token_for_temporary_session' })
  stepToken!: string;

  @ApiProperty({ example: 'signup_info_verified' })
  currentStep!: string;

  @ApiProperty({ example: 'Proceed to next step' })
  message!: string;
}

// Account creation from signup flow (Steps 1-5 aggregated)
export class CreateAccountFromSignupDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  // Personal data from Step 2 verification
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsString()
  birthDate!: string;

  @ApiProperty({ enum: ['M', 'F'], example: 'M' })
  @IsEnum(['M', 'F'])
  gender!: 'M' | 'F';

  @ApiProperty({ example: '01012345678' })
  @IsString()
  phone!: string;

  // Address from Step 4
  @ApiProperty({ example: 'Seoul' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'KT 선릉타워 West' })
  @IsString()
  buildingName!: string;

  @ApiProperty({ example: '12345', required: false })
  @IsString()
  @IsOptional()
  postcode?: string;

  // Agreements from Step 1
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  agreedToTerms!: boolean;

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  agreedToPrivacy!: boolean;

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  agreedToMarketing!: boolean;

  // NICE verification tokens
  @ApiProperty({ example: 'some_ci_token', required: false })
  @IsString()
  @IsOptional()
  niceCI?: string;

  @ApiProperty({ example: 'some_di_token', required: false })
  @IsString()
  @IsOptional()
  niceDI?: string;
}

// Account creation response DTO
export class CreateAccountResponseDto {
  @ApiProperty({ example: 'd91b6392-b40f-48e2-a3cf-c9aff73e70c4' })
  userId!: string;

  @ApiProperty({ example: 'Account created successfully' })
  message!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;
}

// ==========================
// CORPORATE SIGNUP DTOs
// ==========================

// Business lookup request DTO (Step 3)
export class BusinessLookupDto {
  @ApiProperty({ example: '123-45-67890' })
  @IsString()
  @IsNotEmpty()
  businessRegistrationNumber!: string;

  @ApiProperty({ example: '(주)핀테크솔루션' })
  @IsString()
  @IsNotEmpty()
  companyName!: string;
}

// Business info response DTO
export class BusinessInfoResponseDto {
  @ApiProperty({ example: '(주)핀테크솔루션' })
  name!: string;

  @ApiProperty({ example: '123-45-67890' })
  registrationNumber!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: '서울시 강남구 테헤란로' })
  address!: string;

  @ApiProperty({ example: '02-123-4567', required: false })
  phone?: string;
}

// Corporate account creation from signup flow (Steps 1-5 aggregated)
export class CreateCorporateAccountDto {
  // Step 1: Terms (handled separately - boolean flags below)

  // Step 2: Phone verification
  @ApiProperty({ example: '01012345678' })
  @IsString()
  @IsNotEmpty()
  representativePhone!: string;

  // Step 3: Business info
  @ApiProperty({ example: '(주)핀테크솔루션' })
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @ApiProperty({ example: '123-45-67890' })
  @IsString()
  @IsNotEmpty()
  businessRegistrationNumber!: string;

  // Step 4: Corporate info (address, phone, etc.)
  @ApiProperty({ example: 'Seoul' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'KT 선릉타워 West' })
  @IsString()
  @IsOptional()
  buildingName?: string;

  @ApiProperty({ example: '12345', required: false })
  @IsString()
  @IsOptional()
  postcode?: string;

  @ApiProperty({ example: '02-0000-0000' })
  @IsString()
  @IsNotEmpty()
  corporatePhone!: string;

  // Step 5: Email and credentials
  @ApiProperty({ example: 'corporate@company.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  // Agreements from Step 1
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  agreedToTerms!: boolean;

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  agreedToPrivacy!: boolean;

  @ApiProperty({ example: true, required: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  agreedToMarketing?: boolean;
}
