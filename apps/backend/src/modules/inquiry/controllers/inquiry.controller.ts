import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InquiryService } from '../services/inquiry.service';
import { CreateInquiryDto } from '../dtos/create-inquiry.dto';
import { UpdateInquiryDto } from '../dtos/update-inquiry.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { ResponseDto } from '@common/dtos/response.dto';
import { UserRole } from '@modules/users/enums/user.enum';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Get()
  @ApiOperation({ summary: 'List all inquiries' })
  @ApiResponse({ status: 200, description: 'Inquiries list' })
  async getInquiries(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('mine') mine?: string,
  ): Promise<ResponseDto> {
    // If mine=true is passed, we'd need auth — but for listing, allow public for now
    const inquiries = await this.inquiryService.findAll(undefined, category, status);
    return {
      success: true,
      message: 'Inquiries retrieved successfully',
      data: inquiries,
    };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my inquiries' })
  async getMyInquiries(
    @GetUser() user: User,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<ResponseDto> {
    const inquiries = await this.inquiryService.findAll(user.id, category, status);
    return {
      success: true,
      message: 'My inquiries retrieved successfully',
      data: inquiries,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inquiry detail with comments' })
  @ApiResponse({ status: 200, description: 'Inquiry detail' })
  async getInquiry(@Param('id') id: string): Promise<ResponseDto> {
    const inquiry = await this.inquiryService.findOne(id);
    return {
      success: true,
      message: 'Inquiry retrieved successfully',
      data: inquiry,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry created' })
  async createInquiry(
    @Body() dto: CreateInquiryDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    const inquiry = await this.inquiryService.create(user.id, dto);
    return {
      success: true,
      message: 'Inquiry created successfully',
      data: inquiry,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an inquiry' })
  async updateInquiry(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    const inquiry = await this.inquiryService.update(id, user.id, user.role, dto);
    return {
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry,
    };
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close an inquiry (admin only)' })
  async closeInquiry(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    if (user.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: 'Only admins can close inquiries',
        statusCode: 403,
      };
    }
    const inquiry = await this.inquiryService.close(id);
    return {
      success: true,
      message: 'Inquiry closed successfully',
      data: inquiry,
    };
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to an inquiry' })
  async addComment(
    @Param('id') inquiryId: string,
    @Body() body: { content: string },
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    const isAdmin = user.role === UserRole.ADMIN;
    const comment = await this.inquiryService.addComment(
      inquiryId,
      user.id,
      body.content,
      isAdmin,
    );
    return {
      success: true,
      message: 'Comment added successfully',
      data: comment,
    };
  }
}
