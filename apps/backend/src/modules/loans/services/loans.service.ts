import { Injectable, BadRequestException, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  LoanProduct,
  LoanApplication,
  LoanAccount,
  LoanRepaymentSchedule,
  LoanConsultation,
  LoanApplicationDocument,
} from '../entities';
import {
  CreateLoanApplicationDto,
  UpdateLoanApplicationDto,
  ApproveLoanApplicationDto,
  RejectLoanApplicationDto,
  LoanApplicationResponseDto,
  LoanProductResponseDto,
} from '../dtos';
import {
  LoanApplicationStatus,
  LoanProductType,
  RepaymentMethod,
  CollateralType,
} from '../enums/loan.enum';
import { SEED_LOAN_PRODUCTS } from '../seeds/loan-product.seed';

@Injectable()
export class LoansService implements OnModuleInit {
  constructor(
    @InjectRepository(LoanProduct)
    private readonly loanProductRepository: Repository<LoanProduct>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepository: Repository<LoanApplication>,
    @InjectRepository(LoanAccount)
    private readonly loanAccountRepository: Repository<LoanAccount>,
    @InjectRepository(LoanRepaymentSchedule)
    private readonly repaymentScheduleRepository: Repository<LoanRepaymentSchedule>,
  ) {}

  // ============ LOAN PRODUCTS ============

  async getLoanProducts(
    active: boolean = true,
  ): Promise<LoanProductResponseDto[]> {
    const products = await this.loanProductRepository.find({
      where: { isActive: active },
    });

    return products.map((p) => this.mapLoanProductToDto(p));
  }

  async getLoanProduct(id: string): Promise<LoanProductResponseDto> {
    const product = await this.loanProductRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Loan product with ID ${id} not found`);
    }

    return this.mapLoanProductToDto(product);
  }

  // ============ LOAN APPLICATIONS ============

  async createLoanApplication(
    userId: string,
    createDto: CreateLoanApplicationDto,
  ): Promise<LoanApplicationResponseDto> {
    // Verify loan product exists
    const product = await this.loanProductRepository.findOne({
      where: { id: createDto.loanProductId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Loan product not found or inactive');
    }

    // Validate loan parameters against product limits
    if (createDto.requestedLoanAmount < product.minLoanAmount ||
        createDto.requestedLoanAmount > product.maxLoanAmount) {
      throw new BadRequestException(
        `Loan amount must be between ${product.minLoanAmount} and ${product.maxLoanAmount}`,
      );
    }

    if (createDto.loanPeriod < product.minLoanPeriod ||
        createDto.loanPeriod > product.maxLoanPeriod) {
      throw new BadRequestException(
        `Loan period must be between ${product.minLoanPeriod} and ${product.maxLoanPeriod} months`,
      );
    }

    // Validate LTV
    const ltv = (createDto.requestedLoanAmount / createDto.collateralValue) * 100;
    if (ltv > product.maxLTV) {
      throw new BadRequestException(
        `LTV exceeds maximum of ${product.maxLTV}%. Your LTV: ${ltv.toFixed(2)}%`,
      );
    }

    // Generate unique application number
    const applicationNo = this.generateApplicationNumber();

    // Create application
    const application = this.loanApplicationRepository.create({
      userId,
      loanProductId: createDto.loanProductId,
      applicationNo,
      requestedLoanAmount: createDto.requestedLoanAmount,
      collateralType: createDto.collateralType,
      collateralValue: createDto.collateralValue,
      collateralAddress: createDto.collateralAddress,
      collateralDetails: createDto.collateralDetails,
      applicantNotes: createDto.applicantNotes,
      status: LoanApplicationStatus.PENDING,
      statusHistory: [
        {
          status: LoanApplicationStatus.PENDING,
          date: new Date(),
          note: 'Application created',
        },
      ],
      documents: [],
    });

    const saved = await this.loanApplicationRepository.save(application);
    return this.mapLoanApplicationToDto(saved);
  }

  async getLoanApplications(
    userId: string,
    status?: LoanApplicationStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.loanApplicationRepository.createQueryBuilder('app')
      .where('app.userId = :userId', { userId })
      .orderBy('app.createdAt', 'DESC');

    if (status) {
      query.andWhere('app.status = :status', { status });
    }

    const [applications, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: applications.map((app) => this.mapLoanApplicationToDto(app)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanApplication(id: string): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    return this.mapLoanApplicationToDto(application);
  }

  async updateLoanApplication(
    id: string,
    userId: string,
    updateDto: UpdateLoanApplicationDto,
  ): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    if (application.userId !== userId) {
      throw new BadRequestException('Not authorized to update this application');
    }

    if (application.status !== LoanApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Can only update applications in pending status',
      );
    }

    // Update fields
    if (updateDto.requestedLoanAmount !== undefined) {
      application.requestedLoanAmount = updateDto.requestedLoanAmount;
    }
    if (updateDto.loanPeriod !== undefined) {
      // Note: loanPeriod is not directly on LoanApplication, 
      // this would be set during approval
    }
    if (updateDto.collateralType !== undefined) {
      application.collateralType = updateDto.collateralType;
    }
    if (updateDto.collateralValue !== undefined) {
      application.collateralValue = updateDto.collateralValue;
    }
    if (updateDto.collateralAddress !== undefined) {
      application.collateralAddress = updateDto.collateralAddress;
    }
    if (updateDto.collateralDetails !== undefined) {
      application.collateralDetails = updateDto.collateralDetails;
    }
    if (updateDto.applicantNotes !== undefined) {
      application.applicantNotes = updateDto.applicantNotes;
    }

    const updated = await this.loanApplicationRepository.save(application);
    return this.mapLoanApplicationToDto(updated);
  }

  async submitLoanApplication(
    id: string,
    userId: string,
  ): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    if (application.userId !== userId) {
      throw new BadRequestException('Not authorized to submit this application');
    }

    if (application.status !== LoanApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Can only submit applications in pending status',
      );
    }

    application.status = LoanApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();

    if (!application.statusHistory) {
      application.statusHistory = [];
    }
    application.statusHistory.push({
      status: LoanApplicationStatus.SUBMITTED,
      date: new Date(),
      note: 'Application submitted for review',
    });

    const updated = await this.loanApplicationRepository.save(application);
    return this.mapLoanApplicationToDto(updated);
  }

  async deleteLoanApplication(
    id: string,
    userId: string,
  ): Promise<void> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    if (application.userId !== userId) {
      throw new BadRequestException('Not authorized to delete this application');
    }

    if (application.status !== LoanApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Can only delete applications in pending status',
      );
    }

    await this.loanApplicationRepository.remove(application);
  }

  // ============ ADMIN OPERATIONS ============

  async approveLoanApplication(
    id: string,
    approveDto: ApproveLoanApplicationDto,
  ): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    if (application.status !== LoanApplicationStatus.SUBMITTED &&
        application.status !== LoanApplicationStatus.REVIEWING) {
      throw new BadRequestException(
        'Can only approve submitted or under-review applications',
      );
    }

    application.status = LoanApplicationStatus.APPROVED;
    application.approvedLoanAmount = approveDto.approvedLoanAmount;
    application.approvedInterestRate = approveDto.approvedInterestRate;
    application.approvedLoanPeriod = approveDto.approvedLoanPeriod;
    application.approvedAt = new Date();
    if (approveDto.reviewerNotes) {
      application.reviewerNotes = approveDto.reviewerNotes;
    }

    if (!application.statusHistory) {
      application.statusHistory = [];
    }
    application.statusHistory.push({
      status: LoanApplicationStatus.APPROVED,
      date: new Date(),
      note: approveDto.reviewerNotes || 'Application approved',
    });

    const updated = await this.loanApplicationRepository.save(application);
    return this.mapLoanApplicationToDto(updated);
  }

  async rejectLoanApplication(
    id: string,
    rejectDto: RejectLoanApplicationDto,
  ): Promise<LoanApplicationResponseDto> {
    const application = await this.loanApplicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }

    if (application.status !== LoanApplicationStatus.SUBMITTED &&
        application.status !== LoanApplicationStatus.REVIEWING) {
      throw new BadRequestException(
        'Can only reject submitted or under-review applications',
      );
    }

    application.status = LoanApplicationStatus.REJECTED;
    application.rejectionReason = rejectDto.rejectionReason;
    application.rejectedAt = new Date();
    if (rejectDto.reviewerNotes) {
      application.reviewerNotes = rejectDto.reviewerNotes;
    }

    if (!application.statusHistory) {
      application.statusHistory = [];
    }
    application.statusHistory.push({
      status: LoanApplicationStatus.REJECTED,
      date: new Date(),
      note: rejectDto.rejectionReason,
    });

    const updated = await this.loanApplicationRepository.save(application);
    return this.mapLoanApplicationToDto(updated);
  }

  // ============ HELPER METHODS ============

  private generateApplicationNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000);
    return `APP-${year}-${random.toString().padStart(6, '0')}`;
  }

  private mapLoanProductToDto(product: LoanProduct): LoanProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      productType: product.productType,
      maxLTV: product.maxLTV,
      minInterestRate: product.minInterestRate,
      maxInterestRate: product.maxInterestRate,
      minLoanAmount: product.minLoanAmount,
      maxLoanAmount: product.maxLoanAmount,
      minLoanPeriod: product.minLoanPeriod,
      maxLoanPeriod: product.maxLoanPeriod,
      repaymentMethod: product.repaymentMethod,
      isActive: product.isActive,
      requiredDocuments: product.requiredDocuments || [],
      createdAt: product.createdAt,
    };
  }

  private mapLoanApplicationToDto(
    application: LoanApplication,
  ): LoanApplicationResponseDto {
    return {
      id: application.id,
      applicationNo: application.applicationNo,
      userId: application.userId,
      loanProductId: application.loanProductId,
      requestedLoanAmount: application.requestedLoanAmount,
      approvedLoanAmount: application.approvedLoanAmount || null,
      approvedInterestRate: application.approvedInterestRate || null,
      approvedLoanPeriod: application.approvedLoanPeriod || null,
      collateralType: application.collateralType,
      collateralValue: application.collateralValue,
      collateralAddress: application.collateralAddress,
      collateralDetails: application.collateralDetails || null,
      status: application.status,
      statusHistory: application.statusHistory || [],
      rejectionReason: application.rejectionReason || null,
      documents: (application.documents || []).map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
      })),
      submittedAt: application.submittedAt || null,
      approvedAt: application.approvedAt || null,
      rejectedAt: application.rejectedAt || null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  // ============ SEEDING ============

  async onModuleInit() {
    await this.seedLoanProducts();
  }

  private async seedLoanProducts() {
    try {
      for (const seedProduct of SEED_LOAN_PRODUCTS) {
        const existing = await this.loanProductRepository.findOne({
          where: { id: seedProduct.id },
        });

        if (existing) {
          // Update existing product with new seed data
          await this.loanProductRepository.update(
            { id: seedProduct.id },
            {
              name: seedProduct.name,
              description: seedProduct.description,
              productType: seedProduct.productType,
              maxLTV: seedProduct.maxLTV,
              minInterestRate: seedProduct.minInterestRate,
              maxInterestRate: seedProduct.maxInterestRate,
              minLoanAmount: seedProduct.minLoanAmount,
              maxLoanAmount: seedProduct.maxLoanAmount,
              minLoanPeriod: seedProduct.minLoanPeriod,
              maxLoanPeriod: seedProduct.maxLoanPeriod,
              repaymentMethod: seedProduct.repaymentMethod,
              requiredDocuments: seedProduct.requiredDocuments,
              isActive: seedProduct.isActive,
            },
          );
        } else {
          // Create new product
          await this.loanProductRepository.save(seedProduct);
        }
      }
    } catch (error) {
      console.error('Failed to seed loan products:', error);
    }
  }
}

