import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { User } from '../users/entities/user.entity';
import { BankAccount } from '../users/entities/bank-account.entity';
import { KYCDocument } from '../users/entities/kyc-document.entity';
import { TransactionPIN } from '../users/entities/transaction-pin.entity';
import { PasswordResetOTP } from './entities/password-reset-otp.entity';
import { PhoneVerification } from './entities/sms-verification-code.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { AuthService } from './services/auth.service';
import { SignupService } from './services/signup.service';
import { EncryptionService } from './services/encryption.service';
import { NiceVerificationService } from './services/nice-verification.service';
import { PaygateVerificationService } from './services/paygate-verification.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './controllers/auth.controller';
import { VerificationController } from './controllers/verification.controller';
import { EmailService } from '../external-api/services/email.service';
import { SmsService } from '../external-api/services/sms.service';
import { I18nConfigModule } from '../i18n/i18n.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    I18nConfigModule,
    HttpModule,
    ExternalApiModule,
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      BankAccount,
      KYCDocument,
      TransactionPIN,
      PasswordResetOTP,
      PhoneVerification,
      EmailVerification,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    SignupService,
    EncryptionService,
    NiceVerificationService,
    PaygateVerificationService,
    EmailService,
    SmsService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  controllers: [AuthController, VerificationController],
  exports: [
    AuthService,
    SignupService,
    EncryptionService,
    NiceVerificationService,
    PaygateVerificationService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
