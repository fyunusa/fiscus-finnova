import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BankAccount } from '../../users/entities/bank-account.entity';
import { KYCDocument } from '../../users/entities/kyc-document.entity';
import { TransactionPIN } from '../../users/entities/transaction-pin.entity';
import { PasswordResetOTP } from '../entities/password-reset-otp.entity';
import { BankAccountStatus } from '../../users/enums/bank-account.enum';
import { EmailService } from '../../external-api/services/email.service';
import * as bcryptjs from 'bcryptjs';
import { EncryptionService } from './encryption.service';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BankAccount)
    private bankAccountsRepository: Repository<BankAccount>,
    @InjectRepository(KYCDocument)
    private kycDocumentsRepository: Repository<KYCDocument>,
    @InjectRepository(TransactionPIN)
    private transactionPinRepository: Repository<TransactionPIN>,
    @InjectRepository(PasswordResetOTP)
    private passwordResetOTPRepository: Repository<PasswordResetOTP>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return null;

    if (!user.password) return null; // User has no password set

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: 'user',
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }

  generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: 'user',
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    // Calculate signup completion status from related entities
    const verifiedBankAccounts = await this.bankAccountsRepository.find({
      where: { user: { id: user.id }, status: BankAccountStatus.VERIFIED },
    });
    const hasVerifiedBankAccount = verifiedBankAccounts.length > 0;

    const kycDocuments = await this.kycDocumentsRepository.find({
      where: { user: { id: user.id } },
    });
    const hasKYCDocument = kycDocuments.length > 0;

    const transactionPin = await this.transactionPinRepository.findOne({
      where: { user: { id: user.id } },
    });
    const hasTransactionPIN = !!transactionPin;

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        hasVerifiedBankAccount,
        hasKYCDocument,
        hasTransactionPIN,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = await this.validateToken(refreshToken);
    const user = await this.usersRepository.findOne({ where: { id: payload.id } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify OTP token
    if (!/^\d{6}$/.test(token)) {
      throw new BadRequestException('Invalid OTP format');
    }

    // Check if OTP exists and is valid
    const otp = await this.passwordResetOTPRepository.findOne({
      where: {
        email,
        otp: token,
        used: false,
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP has expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    // Mark OTP as used
    otp.used = true;
    await this.passwordResetOTPRepository.save(otp);

    return { message: 'Password reset successfully' };
  }

  async generatePasswordResetOTP(email: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Invalidate previous OTPs for this email
    await this.passwordResetOTPRepository.update(
      { email, used: false },
      { used: true }
    );

    // Save new OTP
    const passwordResetOtp = this.passwordResetOTPRepository.create({
      user,
      email,
      otp,
      expiresAt,
    });
    await this.passwordResetOTPRepository.save(passwordResetOtp);

    return otp;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      // Generate OTP
      const otp = await this.generatePasswordResetOTP(email);

      // Send email with OTP
      const subject = '비밀번호 재설정 인증코드';
      const htmlBody = `
        <html>
          <body>
            <h2>비밀번호 재설정 요청</h2>
            <p>안녕하세요,</p>
            <p>비밀번호를 재설정하기 위해 다음 인증코드를 입력해주세요.</p>
            <h3 style="color: #007bff; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
            <p>이 코드는 15분간 유효합니다.</p>
            <p>요청하지 않으셨다면 이 이메일을 무시해주세요.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Fiscus Financial Platform</p>
          </body>
        </html>
      `;

      await this.emailService.sendEmail(email, subject, htmlBody);
      this.logger.log(`Password reset OTP sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email:`, error);
      throw new BadRequestException('Failed to send reset email');
    }
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
    
    if (user) {
      return {
        available: false,
        message: '이미 등록된 이메일입니다',
      };
    }

    return {
      available: true,
      message: '사용 가능한 이메일입니다',
    };
  }

  async checkPhoneAvailability(phoneNumber: string): Promise<{ available: boolean; message: string }> {
    if (!phoneNumber || !phoneNumber.trim()) {
      throw new BadRequestException('Phone number is required');
    }

    // Normalize phone number (remove non-digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      throw new BadRequestException('올바른 휴대폰 번호를 입력해주세요');
    }

    const user = await this.usersRepository.findOne({ 
      where: { phoneNumber: cleanPhone } 
    });
    
    if (user) {
      return {
        available: false,
        message: '이미 등록된 휴대폰 번호입니다',
      };
    }

    return {
      available: true,
      message: '사용 가능한 휴대폰 번호입니다',
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('User password not set');
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await this.usersRepository.update(
      { id: userId },
      { password: hashedPassword }
    );
  }

  async changePin(userId: string, currentPin: string, newPin: string): Promise<void> {
    if (!currentPin || !newPin) {
      throw new BadRequestException('Current and new PIN are required');
    }

    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) {
      throw new BadRequestException('PIN must be exactly 4 digits');
    }

    const transactionPin = await this.transactionPinRepository.findOne({
      where: { userId }
    });

    if (!transactionPin) {
      throw new BadRequestException('No PIN found for this user');
    }

    if (!transactionPin.pinHash) {
      throw new BadRequestException('User PIN not set');
    }

    // Verify current PIN
    const isPinValid = await bcryptjs.compare(currentPin, transactionPin.pinHash);
    if (!isPinValid) {
      throw new BadRequestException('Current PIN is incorrect');
    }

    // Hash new PIN
    const hashedPin = await bcryptjs.hash(newPin, 10);

    // Update PIN
    await this.transactionPinRepository.update(
      { id: transactionPin.id },
      { pinHash: hashedPin }
    );
  }
}
