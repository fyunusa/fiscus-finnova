import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentsService } from '../services/investments.service';
import { CreateInvestmentDto } from '../dtos/create-investment.dto';
import { UpdateInvestmentDto } from '../dtos/update-investment.dto';
import { InvestmentResponseDto, UserInvestmentResponseDto } from '../dtos/investment-response.dto';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { UserInvestmentStatusEnum } from '@common/enums/investment.enum';

@ApiTags('Investments')
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ===================== PUBLIC ENDPOINTS ===================== //

  /**
   * Get all investments with filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all investments' })
  @ApiResponse({ status: 200, description: 'Investments retrieved' })
  async getInvestments(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'popular' | 'new' | 'ending' | 'high',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseDto> {
    try {
      const result = await this.investmentsService.findAll({
        type,
        status,
        sort,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      });

      return generateSuccessResponse('Investments retrieved successfully', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve investments');
    }
  }

  /**
   * Get investment detail
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get investment detail' })
  @ApiResponse({ status: 200, description: 'Investment retrieved' })
  async getInvestmentDetail(@Param('id') id: string): Promise<ResponseDto> {
    try {
      const investment = await this.investmentsService.findOne(id);
      return generateSuccessResponse('Investment retrieved successfully', investment);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve investment');
    }
  }

  /**
   * Get investment with all investors
   */
  @Get(':id/investors')
  @ApiOperation({ summary: 'Get investment with investor details' })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  async getInvestmentWithInvestors(@Param('id') id: string): Promise<ResponseDto> {
    try {
      const result = await this.investmentsService.getInvestmentWithInvestors(id);
      return generateSuccessResponse('Retrieved successfully', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve investment details');
    }
  }

  // ===================== USER INVESTMENT ENDPOINTS ===================== //

  /**
   * Get user's investments
   */
  @Get('user/my-investments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user investments' })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  async getUserInvestments(@GetUser() user: User): Promise<ResponseDto> {
    try {
      const userInvestments = await this.investmentsService.getUserInvestments(user.id);
      return generateSuccessResponse('User investments retrieved', userInvestments);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve user investments');
    }
  }

  /**
   * Add investment for user
   */
  @Post(':id/invest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invest in an investment' })
  @ApiResponse({ status: 201, description: 'Investment created' })
  async investInProduct(
    @Param('id') investmentId: string,
    @Body() body: { amount: number },
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      if (!body.amount || body.amount <= 0) {
        throw new BadRequestException('Investment amount must be greater than 0');
      }

      const userInvestment = await this.investmentsService.addUserInvestment(
        user.id,
        investmentId,
        body.amount,
      );

      return generateSuccessResponse('Investment created successfully', userInvestment);
    } catch (error) {
      handleStandardException(error, 'Failed to create investment');
    }
  }

  // ===================== ADMIN ENDPOINTS ===================== //

  /**
   * Create new investment (admin only)
   */
  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create investment (admin)' })
  @ApiResponse({ status: 201, description: 'Investment created' })
  async createInvestment(
    @Body() createInvestmentDto: CreateInvestmentDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      // Check admin role (you should add role check here)
      const investment = await this.investmentsService.create(createInvestmentDto);
      return generateSuccessResponse('Investment created successfully', investment);
    } catch (error) {
      handleStandardException(error, 'Failed to create investment');
    }
  }

  /**
   * Update investment (admin only)
   */
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update investment (admin)' })
  @ApiResponse({ status: 200, description: 'Investment updated' })
  async updateInvestment(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      // Check admin role (you should add role check here)
      const investment = await this.investmentsService.update(id, updateInvestmentDto);
      return generateSuccessResponse('Investment updated successfully', investment);
    } catch (error) {
      handleStandardException(error, 'Failed to update investment');
    }
  }

  /**
   * Delete investment (admin only)
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete investment (admin)' })
  @ApiResponse({ status: 204, description: 'Investment deleted' })
  async deleteInvestment(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      // Check admin role (you should add role check here)
      await this.investmentsService.delete(id);
      return generateSuccessResponse('Investment deleted successfully', {});
    } catch (error) {
      handleStandardException(error, 'Failed to delete investment');
    }
  }

  /**
   * Update user investment status (admin only)
   */
  @Patch('admin/user-investment/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update user investment status (admin)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateUserInvestmentStatus(
    @Param('id') userInvestmentId: string,
    @Body() body: { status: UserInvestmentStatusEnum },
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      // Check admin role (you should add role check here)
      const userInvestment = await this.investmentsService.updateUserInvestmentStatus(
        userInvestmentId,
        body.status,
      );
      return generateSuccessResponse('Status updated successfully', userInvestment);
    } catch (error) {
      handleStandardException(error, 'Failed to update status');
    }
  }

  // ===================== FAVORITES ENDPOINTS ===================== //

  /**
   * Add investment to favorites
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add investment to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites' })
  async addToFavorites(
    @Param('id') investmentId: string,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      const result = await this.investmentsService.addToFavorites(user.id, investmentId);
      return generateSuccessResponse('Added to favorites', result);
    } catch (error) {
      handleStandardException(error, 'Failed to add to favorites');
    }
  }

  /**
   * Remove investment from favorites
   */
  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove investment from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites' })
  async removeFromFavorites(
    @Param('id') investmentId: string,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      const result = await this.investmentsService.removeFromFavorites(user.id, investmentId);
      return generateSuccessResponse('Removed from favorites', result);
    } catch (error) {
      handleStandardException(error, 'Failed to remove from favorites');
    }
  }

  /**
   * Get user's favorite investments
   */
  @Get('user/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user favorite investments' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved' })
  async getUserFavorites(@GetUser() user: User): Promise<ResponseDto> {
    try {
      const result = await this.investmentsService.getUserFavorites(user.id);
      return generateSuccessResponse('Favorites retrieved', result);
    } catch (error) {
      handleStandardException(error, 'Failed to retrieve favorites');
    }
  }

  /**
   * Check if investment is favorited by user
   */
  @Get(':id/is-favorited')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check if investment is favorited' })
  @ApiResponse({ status: 200, description: 'Check completed' })
  async isFavorited(
    @Param('id') investmentId: string,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    try {
      const isFavorited = await this.investmentsService.isFavorited(user.id, investmentId);
      return generateSuccessResponse('Check completed', { isFavorited });
    } catch (error) {
      handleStandardException(error, 'Failed to check favorite status');
    }
  }
}
