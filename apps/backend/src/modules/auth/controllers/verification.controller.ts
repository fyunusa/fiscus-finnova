import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { NiceVerificationService } from '../services/nice-verification.service';
import { PaygateVerificationService } from '../services/paygate-verification.service';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';

// DTOs for requests/responses
interface InitiateNiceVerificationDto {
  name: string;
  phone: string;
  birthDate?: string;
  gender?: 'M' | 'F';
}

interface VerifyNiceCodeDto {
  token: string;
  code: string;
}

interface Initiate1WonDto {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

interface Verify1WonCodeDto {
  token: string;
  code: string;
}

interface NiceVerificationResponse {
  success: boolean;
  token?: string;
  ci?: string;
  di?: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  message?: string;
  error?: string;
}

interface AccountVerificationResponse {
  success: boolean;
  verified?: boolean;
  message?: string;
  error?: string;
}

@ApiTags('Verification')
@Controller('account-verification')
export class VerificationController {
  constructor(
    private readonly niceService: NiceVerificationService,
    private readonly paygateService: PaygateVerificationService,
  ) {}

  // ===================== NICE IDENTITY VERIFICATION ===================== //

  @Post('initiate-nice')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Initiate NICE identity verification' })
  @ApiResponse({ status: 200, description: 'Verification initiated' })
  async initiateNiceVerification(
    @Body() dto: InitiateNiceVerificationDto,
  ): Promise<ResponseDto<NiceVerificationResponse>> {
    try {
      console.log('🔵 Initiating NICE verification:', {
        name: dto.name,
        phone: dto.phone,
      });

      // Call NICE API service
      const result = await this.niceService.requestVerification(dto);

      if (!result.success) {
        throw new BadRequestException(result.error || 'NICE verification failed');
      }

      return generateSuccessResponse('NICE verification initiated', {
        success: true,
        token: result.token,
        message: 'Verification code sent to phone',
      });
    } catch (error) {
      handleStandardException(error, 'NICE verification initiation failed');
    }
  }

  @Post('verify-nice-code')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Verify NICE code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verifyNiceCode(
    @Body() dto: VerifyNiceCodeDto,
  ): Promise<ResponseDto<NiceVerificationResponse>> {
    try {
      console.log('🔵 Verifying NICE code for token:', dto.token);

      if (!dto.token || !dto.code) {
        throw new BadRequestException('Token and code are required');
      }

      // Call NICE API service to verify code
      const result = await this.niceService.verifyCode(dto.token, dto.code);

      if (!result.success || !result.verified) {
        throw new BadRequestException(result.error || 'Code verification failed');
      }

      return generateSuccessResponse('Code verified successfully', {
        success: true,
        verified: true,
        ci: result.ci,
        di: result.di,
        name: result.name,
        birthDate: result.birthDate,
        gender: result.gender,
        message: 'Identity verified',
      });
    } catch (error) {
      handleStandardException(error, 'Code verification failed');
    }
  }

  // ===================== 1 WON ACCOUNT VERIFICATION ===================== //

  @Post('initiate-1won')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Initiate 1 won micro-deposit verification' })
  @ApiResponse({ status: 200, description: '1 won transfer initiated' })
  async initiate1Won(
    @Body() dto: Initiate1WonDto,
  ): Promise<ResponseDto<AccountVerificationResponse>> {
    try {
      console.log('🟢 Initiating 1 won transfer:', {
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber.slice(-4),
      });

      // Call Paygate service
      const result = await this.paygateService.initiate1WonTransfer(dto);

      if (!result.success) {
        throw new BadRequestException(result.error || 'Transfer initiation failed');
      }

      return generateSuccessResponse('1 won transfer initiated', {
        success: true,
        token: result.token,
        message: '1 won transferred to your account',
      });
    } catch (error) {
      handleStandardException(error, '1 won transfer failed');
    }
  }

  @Post('verify-1won')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Verify 1 won code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verify1WonCode(
    @Body() dto: Verify1WonCodeDto,
  ): Promise<ResponseDto<AccountVerificationResponse>> {
    try {
      console.log('🟢 Verifying 1 won code for token:', dto.token);

      if (!dto.token || !dto.code) {
        throw new BadRequestException('Token and code are required');
      }

      // Call Paygate service to verify code
      const result = await this.paygateService.verify1WonCode(dto.token, dto.code);

      if (!result.success || !result.verified) {
        throw new BadRequestException(result.error || 'Code verification failed');
      }

      return generateSuccessResponse('Account verified successfully', {
        success: true,
        verified: true,
        message: 'Account ownership confirmed',
      });
    } catch (error) {
      handleStandardException(error, 'Account verification failed');
    }
  }
}
