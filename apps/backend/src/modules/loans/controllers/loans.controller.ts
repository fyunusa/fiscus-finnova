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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { LoansService } from '../services/loans.service';
import {
  CreateLoanApplicationDto,
  UpdateLoanApplicationDto,
  ApproveLoanApplicationDto,
  RejectLoanApplicationDto,
  CreateLoanConsultationDto,
} from '../dtos';
import { LoanApplicationStatus } from '../enums/loan.enum';

@ApiTags('Loans')
@Controller('loans')
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
  async createConsultation(@Body() createDto: CreateLoanConsultationDto) {
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

  // ============ ADMIN ENDPOINTS ============
  // These should be in a separate admin controller with proper authorization

  /**
   * PUT /api/loans/applications/:id/approve
   * Approve loan application (Admin only)
   */
  @Put('applications/:id/approve')
  @UseGuards(JwtAuthGuard) // TODO: Add AdminGuard
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
  @UseGuards(JwtAuthGuard) // TODO: Add AdminGuard
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
}
