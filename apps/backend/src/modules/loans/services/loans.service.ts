import { Injectable, BadRequestException, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  LoanProduct,
  LoanApplication,
  LoanAccount,
  LoanRepaymentSchedule,
} from '../entities';
import { LoanRepaymentTransaction, TransactionStatus } from '../entities/loan-repayment-transaction.entity';
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
  RepaymentMethod,
  LoanAccountStatus,
  PaymentMethod,
  RepaymentStatus,
} from '../enums/loan.enum';
import { SEED_LOAN_PRODUCTS } from '../seeds/loan-product.seed';
import { PaymentGatewayService } from '@modules/external-api/services/payment-gateway.service';
import { PublicDataService, PropertyValuationData } from '@modules/external-api/services/public-data.service';
import { User } from '@modules/users/entities/user.entity';
import { VirtualAccount } from '@modules/users/entities/virtual-account.entity';
import { VirtualAccountStatus } from '@modules/users/enums/virtual-account.enum';

@Injectable()
export class LoansService implements OnModuleInit {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    @InjectRepository(LoanProduct)
    private readonly loanProductRepository: Repository<LoanProduct>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepository: Repository<LoanApplication>,
    @InjectRepository(LoanAccount)
    private readonly loanAccountRepository: Repository<LoanAccount>,
    @InjectRepository(LoanRepaymentSchedule)
    private readonly repaymentScheduleRepository: Repository<LoanRepaymentSchedule>,
    @InjectRepository(LoanRepaymentTransaction)
    private readonly repaymentTransactionRepository: Repository<LoanRepaymentTransaction>,
    @InjectRepository(VirtualAccount)
    private readonly virtualAccountRepository: Repository<VirtualAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly publicDataService: PublicDataService,
    private readonly dataSource: DataSource,
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

    if (createDto.requestedLoanPeriod < product.minLoanPeriod ||
        createDto.requestedLoanPeriod > product.maxLoanPeriod) {
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
      requestedLoanPeriod: createDto.requestedLoanPeriod,
      requestedInterestRate: createDto.requestedInterestRate,
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

    // Map applications to DTOs (loanAccountId is already in the entity)
    const dtos = applications.map((app) => this.mapLoanApplicationToDto(app));

    return {
      data: dtos,
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
    if (updateDto.requestedLoanPeriod !== undefined) {
      application.requestedLoanPeriod = updateDto.requestedLoanPeriod;
    }
    if (updateDto.requestedInterestRate !== undefined) {
      application.requestedInterestRate = updateDto.requestedInterestRate;
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
    // Use transaction to ensure atomicity
    return await this.dataSource.transaction(async (manager) => {
      // Get application with transaction manager
      const application = await manager.findOne(LoanApplication, {
        where: { id },
      });

      if (!application) {
        throw new NotFoundException(`Loan application with ID ${id} not found`);
      }

      if (application.status !== LoanApplicationStatus.PENDING &&
          application.status !== LoanApplicationStatus.SUBMITTED &&
          application.status !== LoanApplicationStatus.REVIEWING) {
        throw new BadRequestException(
          'Can only approve pending, submitted or under-review applications',
        );
      }

      // Get loan product
      const product = await manager.findOne(LoanProduct, {
        where: { id: application.loanProductId },
      });

      if (!product) {
        throw new NotFoundException(`Loan product with ID ${application.loanProductId} not found`);
      }

      // Set approval details
      application.status = LoanApplicationStatus.APPROVED;
      application.approvedLoanAmount = approveDto.approvedLoanAmount;
      // Use requested rate as default if admin doesn't override it
      application.approvedInterestRate = 
        approveDto.approvedInterestRate !== undefined && approveDto.approvedInterestRate !== null
          ? approveDto.approvedInterestRate 
          : application.requestedInterestRate;
      // Use requested period as default if admin doesn't override it
      application.approvedLoanPeriod = 
        approveDto.approvedLoanPeriod !== undefined && approveDto.approvedLoanPeriod !== null
          ? approveDto.approvedLoanPeriod 
          : application.requestedLoanPeriod;
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

      // Save application (will be rolled back if later steps fail)
      const updatedApplication = await manager.save(LoanApplication, application);

      // Create LoanAccount - if this fails, entire transaction is rolled back
      const principalAmount = updatedApplication.approvedLoanAmount || updatedApplication.requestedLoanAmount;
      const interestRate = updatedApplication.approvedInterestRate || updatedApplication.requestedInterestRate || 0;
      const loanPeriod = updatedApplication.approvedLoanPeriod || updatedApplication.requestedLoanPeriod;
      const repaymentMethod = product.repaymentMethod || RepaymentMethod.EQUAL_PRINCIPAL_INTEREST;

      // Generate unique account number
      const accountNumber = `LA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate next payment date (typically 30 days from now or next month)
      const nextPaymentDate = new Date();
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

      // Calculate target end date based on loan period
      const targetEndDate = new Date();
      targetEndDate.setMonth(targetEndDate.getMonth() + loanPeriod);

      // Create loan account object
      const loanAccountData = {
        accountNumber,
        userId: updatedApplication.userId,
        loanApplicationId: updatedApplication.id,
        principalAmount,
        principalBalance: principalAmount,
        interestRate,
        loanPeriod,
        repaymentMethod,
        remainingPeriod: loanPeriod,
        nextPaymentAmount: 0, // Will be set from schedule
        nextPaymentDate,
        startDate: new Date(),
        targetEndDate,
        status: LoanAccountStatus.ACTIVE,
        totalInterestAccrued: Math.round((principalAmount * interestRate) / 12 / 100),
        totalPaid: 0,
        overdueMonths: 0,
        overdueAmount: 0,
      };

      // Save loan account
      const loanAccount = manager.create(LoanAccount, loanAccountData);
      const savedLoanAccount = await manager.save(LoanAccount, loanAccount);
      
      this.logger.log(
        `Loan account created for application ${updatedApplication.id}: Principal ₩${principalAmount}, Initial Interest ₩${savedLoanAccount.totalInterestAccrued}`,
      );

      // Create repayment schedule
      const schedules = this.generateRepaymentSchedule(
        savedLoanAccount,
        principalAmount,
        interestRate,
        loanPeriod,
        repaymentMethod,
      );

      if (schedules && schedules.length > 0) {
        // Save all schedules
        await manager.save(LoanRepaymentSchedule, schedules);

        // Update loan account with next payment amount from first schedule
        savedLoanAccount.nextPaymentAmount = schedules[0].totalPaymentAmount;
        await manager.save(LoanAccount, savedLoanAccount);
      }

      // Update application with loanAccountId
      updatedApplication.loanAccountId = savedLoanAccount.id;
      const finalApplication = await manager.save(LoanApplication, updatedApplication);

      return this.mapLoanApplicationToDto(finalApplication);
    });
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

    if (application.status !== LoanApplicationStatus.PENDING &&
        application.status !== LoanApplicationStatus.SUBMITTED &&
        application.status !== LoanApplicationStatus.REVIEWING) {
      throw new BadRequestException(
        'Can only reject pending, submitted or under-review applications',
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

  // ============ PAYMENT & DISBURSEMENT OPERATIONS ============

  /**
   * Get loan account details
   */
  async getLoanAccount(loanAccountId: string): Promise<any> {
    const loanAccount = await this.loanAccountRepository.findOne({
      where: { id: loanAccountId },
      relations: ['user', 'loanApplication'],
    });

    if (!loanAccount) {
      throw new NotFoundException(`Loan account with ID ${loanAccountId} not found`);
    }

    return {
      id: loanAccount.id,
      accountNumber: loanAccount.accountNumber,
      principalBalance: loanAccount.principalBalance,
      totalPaid: loanAccount.totalPaid,
      totalInterestAccrued: loanAccount.totalInterestAccrued,
      nextPaymentAmount: loanAccount.nextPaymentAmount,
      nextPaymentDate: loanAccount.nextPaymentDate,
      monthlyPaymentAmount: Math.ceil(loanAccount.principalAmount / loanAccount.loanPeriod),
      totalMonths: loanAccount.loanPeriod,
      currentMonth: loanAccount.loanPeriod - loanAccount.remainingPeriod,
      annualInterestRate: loanAccount.interestRate,
      repaymentMethod: loanAccount.repaymentMethod,
      status: loanAccount.status,
      createdAt: loanAccount.createdAt,
      updatedAt: loanAccount.updatedAt,
    };
  }

  /**
   * Get repayment schedule for a loan account
   */
  async getRepaymentSchedule(loanAccountId: string): Promise<any[]> {
    const schedule = await this.repaymentScheduleRepository.find({
      where: { loanAccount: { id: loanAccountId } },
      order: { month: 'ASC' },
    });

    return schedule.map((s) => ({
      id: s.id,
      month: s.month,
      scheduledPaymentDate: s.scheduledPaymentDate,
      principalPayment: s.principalPayment,
      interestPayment: s.interestPayment,
      totalPaymentAmount: s.totalPaymentAmount,
      status: s.paymentStatus,
      actualPaymentDate: s.actualPaymentDate,
      actualPaymentAmount: s.actualPaidAmount,
    }));
  }

  /**
   * Get repayment transaction history for a loan account
   */
  async getRepaymentTransactions(loanAccountId: string): Promise<any[]> {
    const transactions = await this.repaymentTransactionRepository.find({
      where: { loanAccount: { id: loanAccountId } },
      order: { paymentDate: 'DESC' },
    });

    return transactions.map((t) => ({
      id: t.id,
      transactionNo: t.transactionNo,
      paymentAmount: t.paymentAmount,
      paymentDate: t.paymentDate,
      paymentMethod: t.paymentMethod,
      status: t.status,
      principalApplied: t.principalApplied,
      interestApplied: t.interestApplied,
      bankReferences: t.bankReference,
    }));
  }

  /**
   * Disburse approved loan to borrower via virtual account
   * Creates LoanAccount and VirtualAccount entities
   * Transfers funds through Toss Payments
   */
  async disburseLoan(
    loanApplicationId: string,
    userId: string,
    repaymentMethod: RepaymentMethod = RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
  ): Promise<{
    success: boolean;
    loanAccountId: string;
    virtualAccountNumber: string;
    message: string;
  }> {
    // Get application with product
    const application = await this.loanApplicationRepository.findOne({
      where: { id: loanApplicationId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException(`Loan application with ID ${loanApplicationId} not found`);
    }

    if (application.userId !== userId) {
      throw new BadRequestException('Not authorized to disburse this loan');
    }

    if (application.status !== LoanApplicationStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot disburse loan in ${application.status} status. Must be approved first.`,
      );
    }

    if (!application.approvedLoanAmount || !application.approvedInterestRate || !application.approvedLoanPeriod) {
      throw new BadRequestException('Loan approval details are incomplete');
    }

    try {
      // Step 1: Initiate virtual account creation for disbursement via Toss
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const accountHolderName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.email;

      // Initiate virtual account (returns checkout URL)
      const disbursementInitiation = await this.paymentGatewayService.initiateVirtualAccountForDisbursement(
        `DISB-${application.applicationNo}`,
        application.approvedLoanAmount,
        accountHolderName,
        90, // Disbursement account valid for 90 days
      );

      // For now, create a temporary virtual account record with pending status
      // The actual account number will be filled in once user completes checkout
      // Using orderId as temporary account number
      const virtualAccount = this.virtualAccountRepository.create({
        userId,
        accountNumber: `PENDING-${disbursementInitiation.orderId}`, // Temporary number
        accountName: `Loan Disbursement - ${application.applicationNo}`,
        bankCode: '088', // Default to Shinhan Bank (Toss default)
        bankName: 'Shinhan Bank',
        status: VirtualAccountStatus.ACTIVE, // Mark as active even though pending completion
        availableBalance: application.approvedLoanAmount,
        totalDeposited: 0,
        totalWithdrawn: 0,
        frozenBalance: 0,
      });
      const savedVA = await this.virtualAccountRepository.save(virtualAccount);

      // Step 3: Calculate repayment schedule
      const loanStartDate = new Date();
      const loanEndDate = new Date();
      loanEndDate.setMonth(loanEndDate.getMonth() + application.approvedLoanPeriod);

      // Step 4: Create LoanAccount (active loan record)
      const loanAccount = this.loanAccountRepository.create({
        userId,
        loanApplicationId,
        accountNumber: `LOAN-${application.applicationNo}`,
        principalAmount: application.approvedLoanAmount,
        interestRate: application.approvedInterestRate,
        loanPeriod: application.approvedLoanPeriod,
        repaymentMethod,
        principalBalance: application.approvedLoanAmount,
        totalInterestAccrued: 0,
        totalPaid: 0,
        remainingPeriod: application.approvedLoanPeriod,
        nextPaymentAmount: this.calculateMonthlyPayment(
          application.approvedLoanAmount,
          application.approvedInterestRate,
          application.approvedLoanPeriod,
        ),
        nextPaymentDate: new Date(loanStartDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: LoanAccountStatus.ACTIVE,
        startDate: loanStartDate,
        targetEndDate: loanEndDate,
        overdueMonths: 0,
        overdueAmount: 0,
      });
      const savedLoanAccount = await this.loanAccountRepository.save(loanAccount);

      // Step 5: Create repayment schedules
      const schedules = this.generateRepaymentSchedule(
        savedLoanAccount,
        application.approvedLoanAmount,
        application.approvedInterestRate,
        application.approvedLoanPeriod,
        repaymentMethod,
      );
      await this.repaymentScheduleRepository.save(schedules);

      // Step 6: Update application status to ACTIVE
      application.status = LoanApplicationStatus.ACTIVE;
      application.disbursedAt = new Date();
      if (!application.statusHistory) {
        application.statusHistory = [];
      }
      application.statusHistory.push({
        status: LoanApplicationStatus.ACTIVE,
        date: new Date(),
        note: `Loan disbursement initiated. Virtual account: ${savedVA.accountNumber}`,
      });
      await this.loanApplicationRepository.save(application);

      this.logger.log(`Loan ${application.applicationNo} disbursement initiated for VA ${savedVA.accountNumber}`);

      return {
        success: true,
        loanAccountId: savedLoanAccount.id,
        virtualAccountNumber: savedVA.accountNumber,
        message: `Loan disbursement initiated. Virtual account: ${savedVA.accountNumber}. User must complete bank account verification.`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Loan disbursement failed: ${errorMessage}`);
      throw new BadRequestException(`Loan disbursement failed: ${errorMessage}`);
    }
  }

  /**
   * Initiate loan repayment payment with Toss Payments
   * Returns paymentKey and checkout URL for user to complete payment
   */
  async initiateRepayment(
    loanAccountId: string,
    amount: number,
    userId: string,
  ): Promise<{
    paymentKey: string;
    orderId: string;
    checkoutUrl: string;
    amount: number;
  }> {
    // Get loan account
    const loanAccount = await this.loanAccountRepository.findOne({
      where: { id: loanAccountId },
    });

    if (!loanAccount) {
      throw new NotFoundException(`Loan account with ID ${loanAccountId} not found`);
    }

    // Verify ownership
    if (loanAccount.userId !== userId) {
      throw new BadRequestException('Not authorized to process this repayment');
    }

    if (loanAccount.status !== LoanAccountStatus.ACTIVE) {
      throw new BadRequestException(`Cannot process repayment for ${loanAccount.status} account`);
    }

    // Validate amount - can pay up to principal + interest
    const totalOutstanding = Number(loanAccount.principalBalance) + Number(loanAccount.totalInterestAccrued);
    if (amount <= 0 || amount > totalOutstanding) {
      throw new BadRequestException(
        `Invalid repayment amount. Must be between 0 and ${totalOutstanding} (principal: ${loanAccount.principalBalance}, interest: ${loanAccount.totalInterestAccrued})`,
      );
    }

    // Get user for their name
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

    // Initiate payment with Toss
    const orderId = `repay_${loanAccountId}_${Date.now()}`;
    const initiation = await this.paymentGatewayService.initiateVirtualAccountForRepayment(
      orderId,
      amount,
      userName,
      365,
      undefined,
      undefined,
      'Loan Repayment',
    );

    return {
      paymentKey: initiation.paymentKey,
      orderId: initiation.orderId,
      checkoutUrl: initiation.checkoutUrl,
      amount: initiation.amount,
    };
  }

  /**
   * Process loan repayment with explicit orderId
   * Records payment, updates loan balance, and marks schedules as paid
   */
  async processRepaymentWithOrderId(
    loanAccountId: string,
    amount: number,
    paymentKey: string,
    orderId: string | undefined,
    paymentMethod: PaymentMethod = PaymentMethod.VIRTUAL_ACCOUNT,
    userId?: string,
  ): Promise<{
    success: boolean;
    transactionId: string;
    newBalance: number;
    nextPaymentAmount: number;
    loanStatus: string;
    message: string;
  }> {
    // If orderId not provided, generate one as fallback
    const finalOrderId = orderId || `repay_${loanAccountId}_${Date.now()}`;
    
    return this.processRepayment(
      loanAccountId,
      amount,
      paymentKey,
      finalOrderId,
      paymentMethod,
      userId,
    );
  }

  /**
   * Check payment status and auto-process if complete
   * Called by frontend after redirect from Toss checkout
   * Single check - no polling/retry
   */
  async checkAndProcessRepayment(
    loanAccountId: string,
    paymentKey: string,
    orderId: string,
    amount: number,
    userId: string,
  ): Promise<{
    status: string;
    isProcessed: boolean;
    transactionId?: string;
    newBalance?: number;
    nextPaymentAmount?: number;
    loanStatus?: string;
    message: string;
  }> {
    try {
      // Single check - no polling
      const paymentStatus = await this.paymentGatewayService.getPaymentStatusByKey(paymentKey);

      if (!paymentStatus) {
        return {
          status: 'UNKNOWN',
          isProcessed: false,
          message: 'Unable to retrieve payment status',
        };
      }

      // Always attempt to confirm payment (whether DONE or IN_PROGRESS)
      // The confirm endpoint will finalize the payment or advance its state
      try {
        const result = await this.processRepayment(
          loanAccountId,
          amount,
          paymentKey,
          orderId,
          PaymentMethod.VIRTUAL_ACCOUNT,
          userId,
          paymentStatus,
        );

        return {
          status: 'DONE',
          isProcessed: true,
          transactionId: result.transactionId,
          newBalance: result.newBalance,
          nextPaymentAmount: result.nextPaymentAmount,
          loanStatus: result.loanStatus,
          message: result.message,
        };
      } catch (confirmError) {
        // If confirmation fails (e.g., payment still processing), return current status
        this.logger.debug(`Payment confirmation returned status: ${paymentStatus.status}. Not yet complete.`);
        return {
          status: paymentStatus.status,
          isProcessed: false,
          message: `Payment status: ${paymentStatus.status}. Processing...`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to check repayment status: ${errorMessage}`);
      return {
        status: 'ERROR',
        isProcessed: false,
        message: `Error checking payment status: ${errorMessage}`,
      };
    }
  }

  /**
   * Process loan repayment
   * Records payment, updates loan balance, and marks schedules as paid
   */
  async processRepayment(
    loanAccountId: string,
    amount: number,
    paymentKey: string,
    orderId: string,
    paymentMethod: PaymentMethod = PaymentMethod.VIRTUAL_ACCOUNT,
    userId?: string,
    knownPaymentStatus?: { status: string; amount?: number; transactionId?: string },
  ): Promise<{
    success: boolean;
    transactionId: string;
    newBalance: number;
    nextPaymentAmount: number;
    loanStatus: string;
    message: string;
  }> {
    try {
      // Get loan account
      const loanAccount = await this.loanAccountRepository.findOne({
        where: { id: loanAccountId },
        relations: ['repaymentSchedules'],
      });

      if (!loanAccount) {
        throw new NotFoundException(`Loan account with ID ${loanAccountId} not found`);
      }

      // Verify ownership if userId provided
      if (userId && loanAccount.userId !== userId) {
        throw new BadRequestException('Not authorized to process this repayment');
      }

      if (loanAccount.status !== LoanAccountStatus.ACTIVE) {
        throw new BadRequestException(`Cannot process repayment for ${loanAccount.status} account`);
      }

      // Confirm payment with Toss (skip redundant GET if we already know status from polling)
      const paymentConfirmation = await this.paymentGatewayService.confirmRepaymentPayment(
        paymentKey,
        orderId,
        amount,
        knownPaymentStatus,
      );

      if (!paymentConfirmation.success) {
        throw new BadRequestException('Payment confirmation failed');
      }

      // Calculate allocation: principal vs interest (converting to integers for bigint columns)
      // First, pay accumulated interest, then apply remainder to principal
      const accumulatedInterest = Number(loanAccount.totalInterestAccrued);
      const interestToApply = Math.round(Math.min(accumulatedInterest, amount));
      const principalToApply = Math.round(amount - interestToApply);

      // Update loan account (ensure all values are integers for bigint columns)
      // Convert to numbers to prevent string concatenation with bigint values
      loanAccount.principalBalance = Math.max(0, Math.round(Number(loanAccount.principalBalance) - principalToApply));
      loanAccount.totalInterestAccrued = Math.max(0, Math.round(Number(loanAccount.totalInterestAccrued) - interestToApply));
      loanAccount.totalPaid = Math.round(Number(loanAccount.totalPaid) + amount);
      loanAccount.remainingPeriod = Math.max(0, loanAccount.remainingPeriod - 1);

      // Add interest for next period if principal remains
      if (Number(loanAccount.principalBalance) > 0) {
        const nextMonthInterest = Math.round(
          (Number(loanAccount.principalBalance) * Number(loanAccount.interestRate)) / 12 / 100
        );
        loanAccount.totalInterestAccrued = Math.round(
          Number(loanAccount.totalInterestAccrued) + nextMonthInterest
        );
        this.logger.log(
          `Added next month interest (${nextMonthInterest}) to loan ${loanAccountId}. New totalInterestAccrued: ${loanAccount.totalInterestAccrued}`,
        );
      }

      // Calculate next payment - Only CLOSED when BOTH principal AND interest are fully paid
      if (Number(loanAccount.principalBalance) <= 0 && Number(loanAccount.totalInterestAccrued) <= 0) {
        loanAccount.status = LoanAccountStatus.CLOSED;
        loanAccount.closedAt = new Date();
        loanAccount.nextPaymentAmount = 0;
        this.logger.log(`Loan account ${loanAccountId} fully paid - principal: ${loanAccount.principalBalance}, interest: ${loanAccount.totalInterestAccrued}`);
      } else if (Number(loanAccount.principalBalance) <= 0) {
        // Principal paid but interest remains - still active, calculate next payment based on interest
        loanAccount.nextPaymentAmount = Math.round(Number(loanAccount.totalInterestAccrued));
        loanAccount.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        this.logger.log(`Principal paid but interest remains for loan ${loanAccountId}: ${loanAccount.totalInterestAccrued}`);
      } else {
        loanAccount.nextPaymentAmount = Math.round(
          this.calculateMonthlyPayment(
            Number(loanAccount.principalBalance),
            Number(loanAccount.interestRate),
            loanAccount.remainingPeriod,
          )
        );
        loanAccount.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      const updatedLoanAccount = await this.loanAccountRepository.save(loanAccount);

      // Create repayment transaction record
      const transactionNo = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transaction = this.repaymentTransactionRepository.create({
        loanAccountId,
        transactionNo,
        paymentAmount: amount,
        paymentDate: new Date(),
        paymentMethod,
        principalApplied: principalToApply,
        interestApplied: interestToApply,
        status: TransactionStatus.SUCCESS,
        bankReference: paymentConfirmation.transactionId,
      });
      const savedTransaction = await this.repaymentTransactionRepository.save(transaction);

      // Update repayment schedules to PAID (mark as many as possible as paid)
      const unpaidSchedules = loanAccount.repaymentSchedules?.filter(
        (s) => s.paymentStatus === RepaymentStatus.UNPAID,
      ) || [];

      let remainingPrincipalToApply = principalToApply;
      for (const schedule of unpaidSchedules) {
        schedule.paymentStatus = RepaymentStatus.PAID;
        schedule.actualPaymentDate = new Date();
        schedule.actualPaidAmount = schedule.totalPaymentAmount;
        await this.repaymentScheduleRepository.save(schedule);
        if (schedule.totalPaymentAmount <= remainingPrincipalToApply) {
          remainingPrincipalToApply -= schedule.totalPaymentAmount;
        }
      }

      // Update application status to COMPLETED only when loan is fully closed
      // (both principal AND interest are paid)
      if (loanAccount.status === LoanAccountStatus.CLOSED) {
        if (loanAccount.loanApplicationId) {
          const application = await this.loanApplicationRepository.findOne({
            where: { id: loanAccount.loanApplicationId },
          });
          if (application) {
            application.status = LoanApplicationStatus.COMPLETED;
            if (!application.statusHistory) {
              application.statusHistory = [];
            }
            application.statusHistory.push({
              status: LoanApplicationStatus.COMPLETED,
              date: new Date(),
              note: 'Loan fully repaid (principal and interest)',
            });
            await this.loanApplicationRepository.save(application);
            this.logger.log(
              `Application ${loanAccount.loanApplicationId} marked as COMPLETED - Loan ${loanAccountId} fully paid`,
            );
          }
        } else {
          this.logger.warn(`Loan account ${loanAccountId} is CLOSED but has no loanApplicationId`);
        }
      } else if (Number(loanAccount.principalBalance) <= 0 && Number(loanAccount.totalInterestAccrued) > 0) {
        // Log when principal is paid but interest remains
        this.logger.log(
          `Principal paid for loan ${loanAccountId} - Remaining interest: ${loanAccount.totalInterestAccrued}. Loan status remains ACTIVE until interest is fully paid.`,
        );
      }

      this.logger.log(`Repayment processed for loan ${loanAccount.accountNumber}: ${amount} won`);

      return {
        success: true,
        transactionId: savedTransaction.transactionNo,
        newBalance: updatedLoanAccount.principalBalance,
        nextPaymentAmount: updatedLoanAccount.nextPaymentAmount,
        loanStatus: updatedLoanAccount.status,
        message: `Payment of ${amount} won processed successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Repayment processing failed: ${errorMessage}`);
      throw new BadRequestException(`Repayment processing failed: ${errorMessage}`);
    }
  }

  // ============ PROPERTY VALUATION (COLLATERAL ASSESSMENT) ============

  /**
   * Get property valuation data from public data
   * Used to verify collateral value and calculate LTV
   *
   * @param address - Korean property address
   * @returns Property valuation data including transaction history and estimated value
   */
  async getPropertyValuation(address: string): Promise<PropertyValuationData | null> {
    try {
      const valuationData = await this.publicDataService.getPropertyByAddress(address);

      if (!valuationData) {
        this.logger.warn(`No valuation data available for address: ${address}`);
        return null;
      }

      this.logger.log(
        `Property valuation retrieved for ${address}: Estimated value ₩${valuationData.estimatedValue.toLocaleString()}`,
      );

      return valuationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get property valuation: ${errorMessage}`);
      // Don't throw - valuation is optional reference data
      return null;
    }
  }

  /**
   * Validate collateral using public data
   * Cross-references user's collateral value with recent market transactions
   *
   * @param address - Property address
   * @param userClaimedValue - Value claimed by user
   * @returns Validation result with market price and variance
   */
  async validateCollateral(
    address: string,
    userClaimedValue: number,
  ): Promise<{
    isValid: boolean;
    marketEstimate: number;
    claimedValue: number;
    variance: number;
    variancePercent: number;
    status: 'acceptable' | 'overvalued' | 'undervalued' | 'unverifiable';
    message: string;
  }> {
    try {
      const valuation = await this.getPropertyValuation(address);

      if (!valuation) {
        return {
          isValid: false,
          marketEstimate: 0,
          claimedValue: userClaimedValue,
          variance: 0,
          variancePercent: 0,
          status: 'unverifiable',
          message: 'Could not verify collateral value from public records. Manual review required.',
        };
      }

      const variance = userClaimedValue - valuation.estimatedValue;
      const variancePercent = (variance / valuation.estimatedValue) * 100;

      let status: 'acceptable' | 'overvalued' | 'undervalued' | 'unverifiable' = 'acceptable';
      let message = 'Collateral value is within acceptable range';

      // Allow ±10% variance
      if (variancePercent > 10) {
        status = 'overvalued';
        message = `Collateral appears overvalued. User claimed ₩${userClaimedValue.toLocaleString()}, market estimate ₩${valuation.estimatedValue.toLocaleString()}`;
      } else if (variancePercent < -10) {
        status = 'undervalued';
        message = `Collateral appears undervalued. User claimed ₩${userClaimedValue.toLocaleString()}, market estimate ₩${valuation.estimatedValue.toLocaleString()}`;
      }

      return {
        isValid: Math.abs(variancePercent) <= 10,
        marketEstimate: valuation.estimatedValue,
        claimedValue: userClaimedValue,
        variance,
        variancePercent,
        status,
        message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Collateral validation failed: ${errorMessage}`);
      return {
        isValid: false,
        marketEstimate: 0,
        claimedValue: userClaimedValue,
        variance: 0,
        variancePercent: 0,
        status: 'unverifiable',
        message: `Validation error: ${errorMessage}`,
      };
    }
  }

  // ============ HELPER METHODS ============

  private calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number,
  ): number {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
      return Math.ceil(principal / months);
    }
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return Math.ceil(numerator / denominator);
  }

  private generateRepaymentSchedule(
    loanAccount: LoanAccount,
    principal: number,
    annualRate: number,
    months: number,
    repaymentMethod: RepaymentMethod,
  ): LoanRepaymentSchedule[] {
    const schedules: LoanRepaymentSchedule[] = [];
    let remainingPrincipal = principal;

    for (let month = 1; month <= months; month++) {
      const scheduleDate = new Date();
      scheduleDate.setMonth(scheduleDate.getMonth() + month);

      let scheduledPaymentAmount = 0;
      let scheduledPrincipal = 0;
      let scheduledInterest = 0;

      if (repaymentMethod === RepaymentMethod.EQUAL_PRINCIPAL_INTEREST) {
        scheduledPaymentAmount = this.calculateMonthlyPayment(principal, annualRate, months);
        scheduledInterest = (remainingPrincipal * annualRate) / 12 / 100;
        scheduledPrincipal = scheduledPaymentAmount - scheduledInterest;
      } else if (repaymentMethod === RepaymentMethod.EQUAL_PRINCIPAL) {
        scheduledPrincipal = Math.ceil(principal / months);
        scheduledInterest = (remainingPrincipal * annualRate) / 12 / 100;
        scheduledPaymentAmount = scheduledPrincipal + scheduledInterest;
      } else if (repaymentMethod === RepaymentMethod.BULLET) {
        if (month === months) {
          scheduledPrincipal = remainingPrincipal;
          scheduledInterest = (principal * annualRate) / 12 / 100;
          scheduledPaymentAmount = scheduledPrincipal + scheduledInterest;
        } else {
          scheduledPaymentAmount = (principal * annualRate) / 12 / 100;
          scheduledInterest = scheduledPaymentAmount;
          scheduledPrincipal = 0;
        }
      }

      const schedule = new LoanRepaymentSchedule();
      schedule.loanAccount = loanAccount;
      schedule.loanAccountId = loanAccount.id;
      schedule.month = month;
      schedule.scheduledPaymentDate = scheduleDate;
      schedule.principalPayment = Math.ceil(scheduledPrincipal);
      schedule.interestPayment = Math.ceil(scheduledInterest);
      schedule.totalPaymentAmount = Math.ceil(scheduledPaymentAmount);
      schedule.paymentStatus = RepaymentStatus.UNPAID;
      schedule.actualPaidAmount = 0;

      schedules.push(schedule);
      remainingPrincipal = Math.max(0, remainingPrincipal - scheduledPrincipal);
    }

    return schedules;
  }

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
      requestedLoanPeriod: application.requestedLoanPeriod,
      requestedInterestRate: application.requestedInterestRate || null,
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
      loanAccountId: application.loanAccountId || null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  private async mapLoanApplicationToDtoWithAccount(
    application: LoanApplication,
  ): Promise<LoanApplicationResponseDto> {
    const dto = this.mapLoanApplicationToDto(application);

    try {
      // Try to find associated loan account by loanApplicationId first
      let loanAccount = await this.loanAccountRepository.findOne({
        where: { loanApplicationId: application.id },
      });

      // If not found and application is active, try to find by userId and active status (fallback)
      if (!loanAccount && application.status === LoanApplicationStatus.ACTIVE) {
        loanAccount = await this.loanAccountRepository.findOne({
          where: { 
            userId: application.userId,
            status: LoanAccountStatus.ACTIVE,
          },
          order: { createdAt: 'DESC' },
        });
      }

      dto.loanAccountId = loanAccount?.id || null;
    } catch (err) {
      this.logger.warn(`Failed to fetch loan account for application ${application.id}:`, err);
      dto.loanAccountId = null;
    }

    return dto;
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

