import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
   UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UsersService } from '../services/users.service';
import { BankAccountService } from '../services/bank-account.service';
import { KYCDocumentService } from '../services/kyc-document.service';
import { TransactionPINService } from '../services/transaction-pin.service';
import { CreateUserInputDto } from '../dtos/input.dto';
import { UpdateUserInputDto } from '../dtos/update.dto';
import { UserOutputDto } from '../dtos/output.dto';
import { CreateBankAccountDto, BankAccountResponseDto } from '../dtos/bank-account.dto';
import { CreateKYCDocumentDto, ReviewKYCDocumentDto, KYCDocumentResponseDto } from '../dtos/kyc-document.dto';
import { SetTransactionPINDto, TransactionPINResponseDto } from '../dtos/transaction-pin.dto';
import { ResponseDto } from '@common/dtos/response.dto';
import { generateSuccessResponse, generatePaginatedResponse } from '@common/helpers/response.helper';
import { handleStandardException } from '@common/helpers/exception.helper';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bankAccountService: BankAccountService,
    private readonly kycDocumentService: KYCDocumentService,
    private readonly transactionPINService: TransactionPINService,
  ) {}

  // Bank Account Endpoints
  @Post('bank-accounts')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bank account for logged-in user' })
  @ApiResponse({
    status: 201,
    description: 'Bank account created successfully',
  })
  async createBankAccount(
    @GetUser() user: User,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ): Promise<ResponseDto<BankAccountResponseDto>> {
    try {
      const account = await this.bankAccountService.createBankAccount(user.id, createBankAccountDto);
      return generateSuccessResponse('Bank account created successfully', account);
    } catch (error) {
      handleStandardException(error, 'Failed to create bank account');
    }
  }

  @Get('bank-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bank accounts for logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of bank accounts',
  })
  async getBankAccounts(@GetUser() user: User): Promise<ResponseDto<BankAccountResponseDto[]>> {
    try {
      const accounts = await this.bankAccountService.getBankAccountsByUserId(user.id);
      return generateSuccessResponse('Bank accounts retrieved successfully', accounts);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch bank accounts');
    }
  }

  @Get('bank-accounts/default')
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: 'Get default bank account for logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Default bank account',
  })
  async getDefaultBankAccount(@GetUser() user: User): Promise<ResponseDto<BankAccountResponseDto>> {
    try {
      const account = await this.bankAccountService.getDefaultBankAccount(user.id);
      return generateSuccessResponse('Default bank account retrieved successfully', account);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch default bank account');
    }
  }

  @Put('bank-accounts/:bankAccountId/default')
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: 'Set a bank account as default' })
  @ApiResponse({
    status: 200,
    description: 'Default bank account updated',
  })
  async setDefaultBankAccount(
    @GetUser() user: User,
    @Param('bankAccountId') bankAccountId: string,
  ): Promise<ResponseDto<BankAccountResponseDto>> {
    try {
      const account = await this.bankAccountService.setAsDefault(bankAccountId, user.id);
      return generateSuccessResponse('Default bank account updated successfully', account);
    } catch (error) {
      handleStandardException(error, 'Failed to update default bank account');
    }
  }

  @Delete('bank-accounts/:bankAccountId')
  @UseGuards(JwtAuthGuard)
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiResponse({
    status: 200,
    description: 'Bank account deleted',
  })
  async deleteBankAccount(
    @GetUser() user: User,
    @Param('bankAccountId') bankAccountId: string,
  ): Promise<ResponseDto> {
    try {
      await this.bankAccountService.deleteBankAccount(bankAccountId, user.id);
      return generateSuccessResponse('Bank account deleted successfully');
    } catch (error) {
      handleStandardException(error, 'Failed to delete bank account');
    }
  }

  // KYC Document Endpoints
  @Post('kyc-documents')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idDocument', maxCount: 1 },
      { name: 'selfieDocument', maxCount: 1 },
    ], {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file
      },
      fileFilter: (req, file, cb) => {
        // Allow only image files
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)/)) {
          cb(new Error('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload KYC documents (ID and selfie)' })
  @ApiResponse({
    status: 201,
    description: 'KYC documents uploaded successfully',
  })
  async uploadKYCDocument(
    @GetUser() user: User,
    @Body() createKYCDocumentDto: CreateKYCDocumentDto,
    @UploadedFiles() files: {
      idDocument?: Express.Multer.File[];
      selfieDocument?: Express.Multer.File[];
    },
  ): Promise<ResponseDto<KYCDocumentResponseDto[]>> {
    try {
      // console.log('User from ctrller:', user);
      console.log('Received KYC document files:', files);
      const fileObj = {
        idDocument: files.idDocument?.[0],
        selfieDocument: files.selfieDocument?.[0],
      };
      const document = await this.kycDocumentService.uploadDocument(user.id, fileObj);
      return generateSuccessResponse('KYC documents uploaded successfully', document);
    } catch (error) {
      handleStandardException(error, 'Failed to upload KYC documents');
    }
  }

  @Get('kyc-documents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all KYC documents for logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of KYC documents',
  })
  async getKYCDocuments(@GetUser() user: User): Promise<ResponseDto<KYCDocumentResponseDto[]>> {
    try {
      // console.log('User from ctrller:', user);
      const documents = await this.kycDocumentService.getDocumentsByUserId(user.id);
      return generateSuccessResponse('KYC documents retrieved successfully', documents);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch KYC documents');
    }
  }

  @Get('kyc-documents/:documentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific KYC document' })
  @ApiResponse({
    status: 200,
    description: 'KYC document details',
  })
  async getKYCDocument(
    @GetUser() user: User,
    @Param('documentId') documentId: string,
  ): Promise<ResponseDto<KYCDocumentResponseDto>> {
    try {
      const document = await this.kycDocumentService.getDocumentById(documentId, user.id);
      return generateSuccessResponse('KYC document retrieved successfully', document);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch KYC document');
    }
  }

  // Transaction PIN Endpoints

  @Post('transaction-pin')
  @UseGuards(JwtAuthGuard)
  
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Set transaction PIN' })
  @ApiResponse({
    status: 201,
    description: 'Transaction PIN set successfully',
  })
  async setTransactionPIN(
    @GetUser() user: User,
    @Body() setTransactionPINDto: SetTransactionPINDto,
  ): Promise<ResponseDto<TransactionPINResponseDto>> {
    try {
      const pin = await this.transactionPINService.setTransactionPIN(user.id, setTransactionPINDto);
      return generateSuccessResponse('Transaction PIN set successfully', pin);
    } catch (error) {
      handleStandardException(error, 'Failed to set transaction PIN');
    }
  }

  @Get('transaction-pin')
  @UseGuards(JwtAuthGuard)
  
  @ApiOperation({ summary: 'Get PIN status' })
  @ApiResponse({
    status: 200,
    description: 'PIN status retrieved',
  })
  async getPINStatus(@GetUser() user: User): Promise<ResponseDto<TransactionPINResponseDto>> {
    try {
      const pin = await this.transactionPINService.getPINStatus(user.id);
      return generateSuccessResponse('PIN status retrieved successfully', pin);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch PIN status');
    }
  }


    @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async create(@Body() createUserDto: CreateUserInputDto): Promise<ResponseDto<UserOutputDto>> {
    try {
      const user = await this.usersService.create(createUserDto);
      return generateSuccessResponse('User created successfully', user);
    } catch (error) {
      handleStandardException(error, 'Failed to create user');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<ResponseDto> {
    try {
      const result = await this.usersService.findAll(Number(page), Number(limit));
      return generatePaginatedResponse(result.data, result.total, Number(page), Number(limit));
    } catch (error) {
      handleStandardException(error, 'Failed to fetch users');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  async findOne(@Param('id') id: string): Promise<ResponseDto<UserOutputDto>> {
    try {
      const user = await this.usersService.findById(id);
      return generateSuccessResponse('User retrieved successfully', user);
    } catch (error) {
      handleStandardException(error, 'Failed to fetch user');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserInputDto,
  ): Promise<ResponseDto<UserOutputDto>> {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return generateSuccessResponse('User updated successfully', user);
    } catch (error) {
      handleStandardException(error, 'Failed to update user');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  async delete(@Param('id') id: string): Promise<ResponseDto> {
    try {
      await this.usersService.delete(id);
      return generateSuccessResponse('User deleted successfully');
    } catch (error) {
      handleStandardException(error, 'Failed to delete user');
    }
  }
}
