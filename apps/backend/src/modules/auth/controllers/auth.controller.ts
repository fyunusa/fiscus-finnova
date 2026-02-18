import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignupService } from '../services/signup.service';
import { I18nService } from '@modules/i18n/i18n.service';
import { PublicDataService } from '@modules/external-api/services/public-data.service';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

import {
  SignupVerifyIdentityDto,
  VerifyEmailDto,
  VerifySmsDto,
  CreateAccountFromSignupDto,
  CreateCorporateAccountDto,
  BusinessLookupDto,
  BusinessInfoResponseDto,
} from '../dtos/signup.dto';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dtos/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly signupService: SignupService,
    private readonly publicDataService: PublicDataService,
    private readonly i18n: I18nService
  ) {}

  // ===================== LOGIN & REFRESH ===================== //
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto): Promise<ResponseDto> {
    try {
      const result = await this.authService.login(dto.email, dto.password);
      const message = await this.i18n.translate('auth.messages.loginSuccess');

      return generateSuccessResponse(message, result);
    } catch (error) {
      handleStandardException(error, 'Login failed');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refreshToken(@Body() body: { refreshToken: string }): Promise<ResponseDto> {
    try {
      const result = await this.authService.refreshAccessToken(body.refreshToken);
      return generateSuccessResponse('Token refreshed', result);
    } catch (error) {
      handleStandardException(error, 'Token refresh failed');
    }
  }

  // ===================== SIGNUP FLOW =====================

  @Post('signup/send-email-code')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Send email verification code' })
  async sendEmailCode(@Body() body: { email: string }): Promise<ResponseDto> {
    try {
      const result = await this.signupService.sendEmailVerificationCode(body.email);
      return generateSuccessResponse('Verification code sent', result);
    } catch (error) {
      handleStandardException(error, 'Failed to send verification code');
    }
  }

  @Post('signup/verify-email')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify email with code' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ResponseDto> {
    try {
      const result = await this.signupService.verifyEmail(dto);
      return generateSuccessResponse('Email verified', result);
    } catch (error) {
      handleStandardException(error, 'Email verification failed');
    }
  }

  @Post('signup/send-sms-code')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Send SMS verification code' })
  async sendSmsCode(@Body() body: { phoneNumber: string }): Promise<ResponseDto> {
    try {
      const result = await this.signupService.sendSmsVerificationCode(body.phoneNumber);
      return generateSuccessResponse('SMS code sent', result);
    } catch (error) {
      handleStandardException(error, 'Failed to send SMS code');
    }
  }

  @Post('signup/verify-sms')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify phone number with SMS code' })
  async verifySms(@Body() dto: VerifySmsDto): Promise<ResponseDto> {
    try {
      const result = await this.signupService.verifySms(dto);
      return generateSuccessResponse('Phone verified', result);
    } catch (error) {
      handleStandardException(error, 'SMS verification failed');
    }
  }

  @Post('signup/verify-identity')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Step 4: Verify identity with NICE API' })
  async verifyIdentity(
    @Body() body: { email: string; data: SignupVerifyIdentityDto }
  ): Promise<ResponseDto> {
    try {
      const result = await this.signupService.verifyIdentity(body.email, body.data);
      return generateSuccessResponse('Identity verified', result);
    } catch (error) {
      handleStandardException(error, 'Identity verification failed');
    }
  }

  @Post('signup')
  @ApiTags('Individual Auth Signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create account from signup flow (Steps 1-5 aggregated)' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createAccountFromSignup(@Body() dto: CreateAccountFromSignupDto): Promise<ResponseDto> {
    try {
      const result = await this.signupService.createAccountFromSignup(dto);
      const message = await this.i18n.translate('auth.messages.signupSuccess');
      return generateSuccessResponse(message, result);
    } catch (error) {
      handleStandardException(error, await this.i18n.translate('auth.messages.signupFailed'));
    }
  }

  // ===================== CORPORATE SIGNUP FLOW =====================

  @Post('corporate/send-sms-code')
  @ApiTags('Corporate Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Send SMS verification code for corporate signup' })
  async sendCorporateSmsCode(@Body() body: { phoneNumber: string }): Promise<ResponseDto> {
    try {
      const result = await this.signupService.sendSmsVerificationCode(body.phoneNumber);
      return generateSuccessResponse('SMS code sent', result);
    } catch (error) {
      handleStandardException(error, 'Failed to send SMS code');
    }
  }

  @Post('corporate/verify-sms-code')
  @ApiTags('Corporate Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify SMS code for corporate signup' })
  async verifyCorporateSmsCode(@Body() body: { phoneNumber: string; code: string }): Promise<ResponseDto> {
    try {
      const result = await this.signupService.verifyCorporateSmsCode(body.phoneNumber, body.code);
      if (!result.valid) {
        throw new BadRequestException(result.message);
      }
      return generateSuccessResponse(result.message, { valid: true });
    } catch (error) {
      handleStandardException(error, 'Failed to verify SMS code');
    }
  }

  @Post('corporate/lookup-business')
  @ApiTags('Corporate Auth Signup')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Step 3: Lookup business info from NTS API (국세청 연동)' })
  @ApiResponse({ status: 200, description: 'Business info retrieved successfully', type: BusinessInfoResponseDto })
  async lookupBusiness(@Body() dto: BusinessLookupDto): Promise<ResponseDto<BusinessInfoResponseDto>> {
    try {
      const cleanNumber = dto.businessRegistrationNumber.replace(/-/g, '');
      
      if (cleanNumber.length !== 10) {
        throw new BadRequestException('올바른 사업자등록번호를 입력해주세요');
      }

      const businessInfo = await this.publicDataService.getBusinessInfo(cleanNumber);
      
      // Format the response to match frontend expectations
      const response: BusinessInfoResponseDto = {
        name: businessInfo.name,
        registrationNumber: dto.businessRegistrationNumber,
        status: businessInfo.status,
        address: businessInfo.address || '',
        phone: businessInfo.phone,
      };

      return generateSuccessResponse('사업자 정보가 조회되었습니다', response);
    } catch (error) {
      handleStandardException(error, '사업자 정보 조회에 실패했습니다. 다시 시도해주세요.');
    }
  }

  @Post('corporate/signup')
  @ApiTags('Corporate Auth Signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create corporate account from signup flow (Steps 1-5 aggregated)' })
  @ApiResponse({ status: 201, description: 'Corporate account created successfully' })
  async createCorporateAccount(@Body() dto: CreateCorporateAccountDto): Promise<ResponseDto> {
    try {
      const result = await this.signupService.createCorporateAccount(dto);
      return generateSuccessResponse('Corporate account created successfully', result);
    } catch (error) {
      handleStandardException(error, 'Failed to create corporate account');
    }
  }

  // ===================== PASSWORD MANAGEMENT =====================

  @Post('forgot-password')
  @ApiTags('Password Management')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ResponseDto> {
    try {
      // Send reset email with OTP
      await this.authService.sendPasswordResetEmail(dto.email);
      return generateSuccessResponse('비밀번호 재설정 인증코드가 이메일로 발송되었습니다', {});
    } catch (error) {
      handleStandardException(error, 'Failed to process password reset request');
    }
  }

  @Post('reset-password')
  @ApiTags('Password Management')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResponseDto> {
    try {
      // Verify code and reset password
      const result = await this.authService.resetPassword(dto.email, dto.token, dto.newPassword);
      return generateSuccessResponse('Password reset successfully', result);
    } catch (error) {
      handleStandardException(error, 'Failed to reset password');
    }
  }

  // ===================== DUPLICATE CHECK =====================

  @Post('check-email')
  @ApiTags('Validation')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Check if email is already registered' })
  @ApiResponse({ status: 200, description: 'Email availability check result' })
  async checkEmailAvailability(@Body() body: { email: string }): Promise<ResponseDto> {
    try {
      const result = await this.authService.checkEmailAvailability(body.email);
      return generateSuccessResponse(
        result.available ? '사용 가능한 이메일입니다' : '이미 등록된 이메일입니다',
        result
      );
    } catch (error) {
      handleStandardException(error, 'Email check failed');
    }
  }

  @Post('check-phone')
  @ApiTags('Validation')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Check if phone number is already registered' })
  @ApiResponse({ status: 200, description: 'Phone availability check result' })
  async checkPhoneAvailability(@Body() body: { phoneNumber: string }): Promise<ResponseDto> {
    try {
      const result = await this.authService.checkPhoneAvailability(body.phoneNumber);
      return generateSuccessResponse(
        result.available ? '사용 가능한 휴대폰 번호입니다' : '이미 등록된 휴대폰 번호입니다',
        result
      );
    } catch (error) {
      handleStandardException(error, 'Phone check failed');
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Security')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<ResponseDto> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }
      await this.authService.changePassword(userId, body.currentPassword, body.newPassword);
      return generateSuccessResponse('비밀번호가 변경되었습니다', {});
    } catch (error) {
      handleStandardException(error, 'Password change failed');
    }
  }

  @Post('change-pin')
  @UseGuards(JwtAuthGuard)
  @ApiTags('Security')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user transaction PIN' })
  @ApiResponse({ status: 200, description: 'PIN changed successfully' })
  async changePin(
    @Req() req: any,
    @Body() body: { currentPin: string; newPin: string },
  ): Promise<ResponseDto> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }
      await this.authService.changePin(userId, body.currentPin, body.newPin);
      return generateSuccessResponse('PIN이 변경되었습니다', {});
    } catch (error) {
      handleStandardException(error, 'PIN change failed');
    }
  }
}
