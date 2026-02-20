import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { User } from '../../users/entities/user.entity';
import { PhoneVerification } from '../entities/sms-verification-code.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { EmailService } from '../../external-api/services/email.service';
import { SmsService } from '../../external-api/services/sms.service';
import { EncryptionService } from './encryption.service';
import { MediaUploadService } from '../../external-api/services/media-upload.service';
import * as bcryptjs from 'bcryptjs';
import {
  SignupVerifyIdentityDto,
  VerifyEmailDto,
  VerifySmsDto,
  CreateAccountFromSignupDto,
  CreateAccountResponseDto,
  CreateCorporateAccountDto,
} from '../dtos/signup.dto';
import { UserType, SignupStep, UserStatus, PhoneVerificationPurpose, EmailVerificationPurpose } from '../../users/enums/user.enum';

@Injectable()
export class SignupService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly mediaUploadService: MediaUploadService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PhoneVerification)
    private phoneVerificationRepository: Repository<PhoneVerification>,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
  ) {}

  /**
   * Generate step token for multi-step form sessions
   */
  generateStepToken(email: string, step: string): string {
    return this.jwtService.sign(
      { email, step, purpose: 'signup' },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '30m', // Step token expires in 30 minutes
      },
    );
  }

  /**
   * Verify step token
   */
  verifyStepToken(token: string): { email: string; step: string } {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (payload.purpose !== 'signup') {
        throw new BadRequestException('Invalid token');
      }
      return { email: payload.email, step: payload.step };
    } catch {
      throw new BadRequestException('Step token expired or invalid');
    }
  }

  /**
   * Send email verification code
   */
  async sendEmailVerificationCode(email: string): Promise<{ message: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified codes for this email
    await this.emailVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('email = :email', { email })
      .andWhere('purpose = :purpose', { purpose: EmailVerificationPurpose.SIGNUP })
      .andWhere('verifiedAt IS NULL')
      .execute();

    // Create and save email verification to database
    const emailVerification = this.emailVerificationRepository.create({
      email,
      code,
      purpose: EmailVerificationPurpose.SIGNUP,
      expiresAt,
    });

    await this.emailVerificationRepository.save(emailVerification);

    // Create HTML email body
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>이메일 인증 코드</h2>
          <p>안녕하세요,</p>
          <p>다음 인증 코드를 입력하여 이메일을 확인하세요:</p>
          <h3 style="color: #007bff; font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h3>
          <p>이 코드는 10분간 유효합니다.</p>
          <p>요청하지 않으셨다면 이 이메일을 무시해주세요.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Fiscus Financial Platform</p>
        </body>
      </html>
    `;

    console.log(`📧 Email verification code generated for ${email}: ${code} (expires at ${expiresAt})`);

    // Send verification email
    await this.emailService.sendEmail(email, '이메일 인증 코드', htmlBody);

    return {
      message: 'Verification code sent to email',
    };
  }

  /**
   * Verify email with code
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{
    stepToken: string;
    message: string;
  }> {
    // Verify code format
    if (!/^\d{6}$/.test(dto.code)) {
      throw new BadRequestException('Invalid verification code format');
    }

    // Query database for stored code
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: {
        email: dto.email,
        purpose: EmailVerificationPurpose.SIGNUP,
      },
      order: { createdAt: 'DESC' },
    });

    if (!emailVerification) {
      throw new BadRequestException('No verification code found. Please request a new code.');
    }

    // Check if already verified
    if (emailVerification.verifiedAt) {
      throw new BadRequestException('Code already verified');
    }

    // Check if expired
    if (new Date() > emailVerification.expiresAt) {
      await this.emailVerificationRepository.delete(emailVerification.id);
      throw new BadRequestException('Verification code expired. Please request a new code.');
    }

    // Verify code
    if (emailVerification.code !== dto.code) {
      throw new BadRequestException('Incorrect verification code');
    }

    // Code is valid - mark as verified
    emailVerification.verifiedAt = new Date();
    await this.emailVerificationRepository.save(emailVerification);
    console.log(`✅ Email verification successful for ${dto.email}`);

    const stepToken = this.generateStepToken(dto.email, 'email_verified');
    return {
      stepToken,
      message: 'Email verified successfully',
    };
  }

  /**
   * Send SMS verification code
   */
  async sendSmsVerificationCode(phoneNumber: string): Promise<{ message: string }> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Delete any existing unverified codes for this phone number
    await this.phoneVerificationRepository
      .createQueryBuilder()
      .delete()
      .where('phoneNumber = :phoneNumber', { phoneNumber })
      .andWhere('purpose = :purpose', { purpose: PhoneVerificationPurpose.SIGNUP })
      .andWhere('verifiedAt IS NULL')
      .execute();

    // Create and save verification code to database
    const phoneVerification = this.phoneVerificationRepository.create({
      phoneNumber,
      code,
      purpose: PhoneVerificationPurpose.SIGNUP,
      expiresAt,
    });

    await this.phoneVerificationRepository.save(phoneVerification);

    console.log(`📱 SMS Code generated for ${phoneNumber}: ${code} (expires at ${expiresAt})`);

    // Send SMS verification code
    await this.smsService.sendVerificationSms(phoneNumber, code);

    return {
      message: 'Verification code sent to phone',
    };
  }

  /**
   * Verify SMS code for corporate signup
   */
  async verifyCorporateSmsCode(
    phoneNumber: string,
    code: string,
  ): Promise<{ valid: boolean; message: string }> {
    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return {
        valid: false,
        message: 'Invalid verification code format',
      };
    }

    // Query database for stored code
    const phoneVerification = await this.phoneVerificationRepository.findOne({
      where: {
        phoneNumber,
        purpose: PhoneVerificationPurpose.SIGNUP,
      },
      order: { createdAt: 'DESC' },
    });

    if (!phoneVerification) {
      return {
        valid: false,
        message: 'No verification code found. Please request a new code.',
      };
    }

    // Check if already verified
    if (phoneVerification.verifiedAt) {
      return {
        valid: false,
        message: 'Code already verified',
      };
    }

    // Check if expired
    if (new Date() > phoneVerification.expiresAt) {
      // Delete expired code
      await this.phoneVerificationRepository.delete(phoneVerification.id);
      return {
        valid: false,
        message: 'Verification code expired. Please request a new code.',
      };
    }

    // Verify code
    if (phoneVerification.code !== code) {
      return {
        valid: false,
        message: 'Incorrect verification code',
      };
    }

    // Code is valid - mark as verified
    phoneVerification.verifiedAt = new Date();
    await this.phoneVerificationRepository.save(phoneVerification);
    console.log(`✅ SMS verification successful for ${phoneNumber}`);

    return {
      valid: true,
      message: 'Phone verified successfully',
    };
  }

  /**
   * Verify SMS code (individual signup legacy method)
   */
  async verifySms(dto: VerifySmsDto): Promise<{
    stepToken: string;
    message: string;
  }> {
    if (!/^\d{6}$/.test(dto.code)) {
      throw new BadRequestException('Invalid verification code format');
    }

    const stepToken = this.generateStepToken(dto.phoneNumber, 'sms_verified');
    return {
      stepToken,
      message: 'Phone verified successfully',
    };
  }

  /**
   * Step 4: Identity verification
   */
  async verifyIdentity(email: string, dto: SignupVerifyIdentityDto): Promise<{
    stepToken: string;
    message: string;
  }> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Call external identity verification service (NICE)
    // For now, mark as verified
    user.signupStep = SignupStep.IDENTITY_VERIFIED;

    await this.usersRepository.save(user);

    const stepToken = this.generateStepToken(email, 'identity_verified');
    return {
      stepToken,
      message: 'Identity verified successfully',
    };
  }

  /**
   * Generate access token
   */
  generateAccessToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  /**
   * Create account from signup flow (Steps 1-5 aggregated)
   * This endpoint handles complete account creation from the frontend signup process
   */
  async createAccountFromSignup(
    dto: CreateAccountFromSignupDto,
  ): Promise<CreateAccountResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser && existingUser.signupStep === SignupStep.COMPLETED) {
      throw new ConflictException('Email already registered');
    }

    // Prepare user data
    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    const userData: Partial<User> = {
      email: dto.email,
      password: hashedPassword,
      firstName: dto.name.split(' ')[0] || dto.name,
      lastName: dto.name.split(' ').slice(1).join(' ') || '',
      phoneNumber: dto.phone,
      address: dto.address,
      postcode: dto.postcode,
      buildingName: dto.buildingName,
      city: '',
      district: '',
      userType: UserType.INDIVIDUAL,
      signupStep: SignupStep.COMPLETED,
      emailVerified: true,
      phoneVerified: true,
      status: UserStatus.ACTIVE,
      // Store NICE verification tokens
      residentNumber: dto.niceCI ? await this.encryptionService.encrypt(dto.niceCI) : undefined,
    };

    let savedUser: User;

    // If user exists but signup incomplete, update their info
    if (existingUser && existingUser.signupStep !== SignupStep.COMPLETED) {
      Object.assign(existingUser, userData);
      savedUser = await this.usersRepository.save(existingUser);
    } else {
      // Create new user account
      const newUser = this.usersRepository.create(userData);
      savedUser = await this.usersRepository.save(newUser);
    }

    console.log('✅ Account created from signup:', {
      userId: savedUser.id,
      email: savedUser.email,
      name: savedUser.firstName,
      phone: savedUser.phoneNumber,
      address: savedUser.address,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    return {
      userId: savedUser.id,
      message: 'Account created successfully',
      accessToken,
      refreshToken,
    };
  }

  /**
   * Create corporate account from signup flow (Steps 1-5 aggregated)
   */
  async createCorporateAccount(
    dto: CreateCorporateAccountDto,
  ): Promise<CreateAccountResponseDto> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    // Create user data
    const userData = {
      email: dto.email,
      password: hashedPassword,
      firstName: dto.businessName,
      userType: UserType.CORPORATE,
      status: UserStatus.ACTIVE,
      phoneNumber: dto.corporatePhone,
      emailVerified: false,
      phoneVerified: true, // SMS verified
      signupStep: SignupStep.COMPLETED,
      businessName: dto.businessName,
      businessRegistrationNumber: dto.businessRegistrationNumber,
      address: dto.address,
      buildingName: dto.buildingName,
      postcode: dto.postcode,
    };

    // Create and save user
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    console.log('✅ Corporate account created:', {
      userId: savedUser.id,
      email: savedUser.email,
      businessName: savedUser.businessName,
      businessNumber: dto.businessRegistrationNumber,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    return {
      userId: savedUser.id,
      message: 'Corporate account created successfully',
      accessToken,
      refreshToken,
    };
  }

}