import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth,  ApiConsumes } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@modules/users/enums/user.enum';
import { LoansService } from '../services/loans.service';
import {
  CreateLoanApplicationDto,
  UpdateLoanApplicationDto,
  ApproveLoanApplicationDto,
  RejectLoanApplicationDto,
  CreateLoanConsultationDto,
} from '../dtos';
import { LoanApplicationStatus, PaymentMethod } from '../enums/loan.enum';

@ApiTags('Loans')
@Controller('loans')
@ApiBearerAuth('access-token')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // ============ PUBLIC ENDPOINTS ============

  /**
   * GET /api/loans/products
   * Get all active loan products
   */
  @Get('products')
  async getLoanProducts() {
    const products = await this.loansService.getLoanProducts(true);
    return {
      success: true,
      data: products,
    };
  }

  /**
   * GET /api/loans/products/:id
   * Get specific loan product
   */
  @Get('products/:id')
  async getLoanProduct(@Param('id') id: string) {
    const product = await this.loansService.getLoanProduct(id);
    return {
      success: true,
      data: product,
    };
  }

  /**
   * POST /api/loans/consultations
   * Submit consultation request (public endpoint)
   */
  @Post('consultations')
  @HttpCode(HttpStatus.CREATED)
  async createConsultation(@Body() _createDto: CreateLoanConsultationDto) {
    // TODO: Implement consultation service
    return {
      success: true,
      data: {
        id: 'consultation-id',
        message: 'Consultation request submitted successfully',
      },
    };
  }

  // ============ AUTHENTICATED USER ENDPOINTS ============

  /**
   * POST /api/loans/applications
   * Create new loan application
   */
  @Post('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  async createLoanApplication(
    @GetUser() user: User,
    @Body() createDto: CreateLoanApplicationDto,
  ) {
    const application = await this.loansService.createLoanApplication(user.id, createDto);
    return {
      success: true,
      data: application,
    };
  }

  /**
   * GET /api/loans/applications
   * List user's loan applications
   */
  @Get('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getLoanApplications(
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const result = await this.loansService.getLoanApplications(
      user.id,
      status as LoanApplicationStatus,
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /api/loans/applications/:id
   * Get specific loan application
   */
  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getLoanApplication(
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    const application = await this.loansService.getLoanApplication(id);

    // Verify ownership
    if (application.userId !== user.id) {
      throw new BadRequestException('Not authorized to access this application');
    }

    return {
      success: true,
      data: application,
    };
  }

  /**
   * PUT /api/loans/applications/:id
   * Update loan application (only if pending)
   */
  @Put('applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async updateLoanApplication(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateLoanApplicationDto,
  ) {
    const application = await this.loansService.updateLoanApplication(id, user.id, updateDto);
    return {
      success: true,
      data: application,
    };
  }

  /**
   * POST /api/loans/applications/:id/submit
   * Submit completed application for review
   */
  @Post('applications/:id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async submitLoanApplication(
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    const application = await this.loansService.submitLoanApplication(id, user.id);
    return {
      success: true,
      data: application,
    };
  }

  /**
   * DELETE /api/loans/applications/:id
   * Delete loan application (only if pending)
   */
  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLoanApplication(
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    await this.loansService.deleteLoanApplication(id, user.id);
    return null;
  }

  // ============ PAYMENT & DISBURSEMENT ENDPOINTS ============

  /**
   * POST /api/loans/applications/:id/disburse
   * Disburse approved loan to borrower
   * Creates loan account and virtual account for receiving funds
   */
  @Post('applications/:id/disburse')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.CREATED)
  async disburseLoan(
    @GetUser() user: User,
    @Param('id') id: string,
  ) {
    const result = await this.loansService.disburseLoan(id, user.id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /api/loans/accounts/:accountId
   * Get loan account details
   */
  @Get('accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getLoanAccount(@Param('accountId') accountId: string) {
    const account = await this.loansService.getLoanAccount(accountId);
    return {
      success: true,
      data: account,
    };
  }

  /**
   * GET /api/loans/accounts/:accountId/schedule
   * Get repayment schedule for loan account
   */
  @Get('accounts/:accountId/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getRepaymentSchedule(@Param('accountId') accountId: string) {
    const schedule = await this.loansService.getRepaymentSchedule(accountId);
    return {
      success: true,
      data: schedule,
    };
  }

  /**
   * GET /api/loans/accounts/:accountId/transactions
   * Get repayment transaction history
   */
  @Get('accounts/:accountId/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getRepaymentTransactions(@Param('accountId') accountId: string) {
    const transactions = await this.loansService.getRepaymentTransactions(accountId);
    return {
      success: true,
      data: transactions,
    };
  }

  /**
   * POST /api/loans/accounts/:accountId/repay/initiate
   * Initiate repayment payment with Toss Payments
   * Returns paymentKey and checkout URL for user to complete payment
   */
  @Post('accounts/:accountId/repay/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async initiateRepayment(
    @GetUser() user: User,
    @Param('accountId') accountId: string,
    @Body() body: {
      amount: number;
    },
  ) {
    const result = await this.loansService.initiateRepayment(
      accountId,
      body.amount,
      user.id,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /api/loans/accounts/:accountId/repay/status
   * Check payment status and auto-process if complete
   * Called by frontend after redirect from Toss checkout
   */
  @Get('accounts/:accountId/repay/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async checkRepaymentStatus(
    @GetUser() user: User,
    @Param('accountId') accountId: string,
    @Query('paymentKey') paymentKey: string,
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
  ) {
    const result = await this.loansService.checkAndProcessRepayment(
      accountId,
      paymentKey,
      orderId,
      parseFloat(amount),
      user.id,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /api/loans/accounts/:accountId/repay
   * Process loan repayment
   * Records payment, updates balance, and marks schedules as paid
   */
  @Post('accounts/:accountId/repay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async processRepayment(
    @GetUser() user: User,
    @Param('accountId') accountId: string,
    @Body() body: {
      amount: number;
      paymentKey: string;
      orderId?: string;
      paymentMethod?: string;
    },
  ) {
    const paymentMethod = body.paymentMethod || 'virtual_account';
    const result = await this.loansService.processRepaymentWithOrderId(
      accountId,
      body.amount,
      body.paymentKey,
      body.orderId,
      paymentMethod as PaymentMethod,
      user.id,
    );
    return {
      success: true,
      data: result,
    };
  }

  // ============ ADMIN ENDPOINTS ============
  // These should be in a separate admin controller with proper authorization

  /**
   * PUT /api/loans/applications/:id/approve
   * Approve loan application (Admin only)
   */
  @Put('applications/:id/approve')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async approveLoanApplication(
    @Param('id') id: string,
    @Body() approveDto: ApproveLoanApplicationDto,
  ) {
    const application = await this.loansService.approveLoanApplication(id, approveDto);
    return {
      success: true,
      data: application,
    };
  }

  /**
   * PUT /api/loans/applications/:id/reject
   * Reject loan application (Admin only)
   */
  @Put('applications/:id/reject')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  async rejectLoanApplication(
    @Param('id') id: string,
    @Body() rejectDto: RejectLoanApplicationDto,
  ) {
    const application = await this.loansService.rejectLoanApplication(id, rejectDto);
    return {
      success: true,
      data: application,
    };
  }

  // ============ PROPERTY VALUATION ENDPOINTS ============

  /**
   * POST /api/loans/property/validate
   * Validate collateral property using public data
   * Used during loan application to verify user's collateral value claim
   */
  @Post('property/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async validateCollateral(
    @Body() body: {
      address: string;
      claimedValue: number;
    },
  ) {
    const result = await this.loansService.validateCollateral(
      body.address,
      body.claimedValue,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /api/loans/property/valuation
   * Get property valuation data for an address
   * Returns market price estimates and transaction history
   */
  @Get('property/valuation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getPropertyValuation(
    @Query('address') address: string,
  ) {
    if (!address) {
      throw new BadRequestException('Address query parameter is required');
    }

    const valuation = await this.loansService.getPropertyValuation(address);

    if (!valuation) {
      return {
        success: false,
        message: 'No valuation data available for this address',
        data: null,
      };
    }

    return {
      success: true,
      data: valuation,
    };
  }
}
