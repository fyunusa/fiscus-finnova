import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { VirtualAccount } from '../entities/virtual-account.entity';
import { VirtualAccountTransaction } from '../entities/virtual-account-transaction.entity';
import { VirtualAccountRequest, VirtualAccountRequestStatus } from '../entities/virtual-account-request.entity';
import {
  CreateDepositDto,
  CreateWithdrawalDto,
  VirtualAccountResponseDto,
  VirtualAccountTransactionResponseDto,
  DepositHistoryResponseDto,
  VirtualAccountInfoDto,
  VirtualAccountInitiationResponseDto,
  VirtualAccountCompletionResponseDto,
} from '../dtos/virtual-account.dto';
import {
  VirtualAccountStatus,
  TransactionType,
  TransactionStatus,
} from '../enums/virtual-account.enum';
import { User } from '../entities/user.entity';
import { PaymentGatewayService } from '@modules/external-api/services/payment-gateway.service';

@Injectable()
export class VirtualAccountService {
  private readonly logger = new Logger(VirtualAccountService.name);

  constructor(
    @InjectRepository(VirtualAccount)
    private readonly virtualAccountRepository: Repository<VirtualAccount>,
    @InjectRepository(VirtualAccountTransaction)
    private readonly transactionRepository: Repository<VirtualAccountTransaction>,
    @InjectRepository(VirtualAccountRequest)
    private readonly vaRequestRepository: Repository<VirtualAccountRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  /**
   * Private helper: Get virtual account without auto-creating
   * Returns the entity (not DTO) or null if not found
   */
  private async getVirtualAccountIfExists(userId: string): Promise<VirtualAccount | null> {
    return await this.virtualAccountRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Create a virtual account for a new user on signup
   * Creates a real Toss Payments virtual account
   */
  async createVirtualAccountForUser(userId: string): Promise<VirtualAccountResponseDto> {
    // Check if user already has a virtual account
    const existingAccount = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (existingAccount) {
      throw new ConflictException('User already has a virtual account');
    }

    // Create real Toss virtual account
    const tossBankAccount = await this.paymentGatewayService.createVirtualAccountForRepayment(
      `VA-${userId}-${Date.now()}`,
      100, // Minimum amount in won (not 0 - Toss requires minimum amount)
      'Fiscus Investment Account',
      365, // 1 year expiration
    );

    // Save to database
    const virtualAccount = this.virtualAccountRepository.create({
      userId,
      accountNumber: tossBankAccount.accountNumber,
      accountName: tossBankAccount.accountName,
      bankCode: tossBankAccount.bankCode,
      bankName: tossBankAccount.bankName,
      status: VirtualAccountStatus.ACTIVE,
      availableBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      frozenBalance: 0,
    });

    const saved = await this.virtualAccountRepository.save(virtualAccount);
    return this.mapToResponseDto(saved);
  }

  /**
   * Create or get virtual account for user
   * Returns existing account if already created
   * Otherwise initiates virtual account creation via Toss checkout
   */
  async createOrGetVirtualAccount(userId: string): Promise<
    VirtualAccountResponseDto | VirtualAccountInitiationResponseDto
  > {
    const existingAccount = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (existingAccount) {
      return this.mapToResponseDto(existingAccount);
    }

    // Get user for their name
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

    // Initiate virtual account creation with Toss
    const initiation = await this.paymentGatewayService.initiateVirtualAccountForRepayment(
      `VA-${userId}-${Date.now()}`,
      100, // Minimum amount in won
      userName,
      365, // 1 year expiration
      undefined,
      undefined,
      'Virtual Account',
    );

    // Save the pending request
    const vaRequest = this.vaRequestRepository.create({
      userId,
      paymentKey: initiation.paymentKey,
      orderId: initiation.orderId,
      checkoutUrl: initiation.checkoutUrl,
      status: VirtualAccountRequestStatus.PENDING,
      amount: initiation.amount,
      expireDays: 365,
      apiResponse: JSON.stringify(initiation),
    });

    const savedRequest = await this.vaRequestRepository.save(vaRequest);
    this.logger.debug(`Created virtual account request ${savedRequest.id} for user ${userId}`);

    return {
      requestId: savedRequest.id,
      paymentKey: savedRequest.paymentKey,
      orderId: savedRequest.orderId,
      checkoutUrl: savedRequest.checkoutUrl,
      amount: savedRequest.amount,
      status: initiation.status,
      requiresUserAction: initiation.requiresUserAction,
      createdAt: savedRequest.createdAt,
    };
  }

  /**
   * Get user's virtual account
   * Throws NotFoundException if account doesn't exist
   */
  async getVirtualAccount(userId: string): Promise<VirtualAccountResponseDto> {
    const account = await this.getVirtualAccountIfExists(userId);
    if (!account) {
      throw new NotFoundException('Virtual account not found. Please create one first.');
    }
    return this.mapToResponseDto(account);
  }

  /**
   * Helper: sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: check payment status with polling
   * Retries up to maxAttempts times with delays
   */
  private async checkPaymentWithPolling(
    paymentKey: string,
    maxAttempts: number = 5,
    delayMs: number = 2000,
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.debug(`Checking payment status (attempt ${attempt}/${maxAttempts}) for ${paymentKey}`);

      const accountDetails = await this.paymentGatewayService.getVirtualAccountFromPayment(paymentKey);

      if (accountDetails) {
        this.logger.debug(`Virtual account issued on attempt ${attempt}`);
        return accountDetails;
      }

      if (attempt < maxAttempts) {
        this.logger.debug(`Account not ready yet. Waiting ${delayMs}ms before retry...`);
        await this.sleep(delayMs);
      }
    }

    return null;
  }

  /**
   * Complete virtual account creation after user finishes checkout
   * Called after user returns from Toss payment gateway
   * Retrieves account details from payment and creates actual virtual account
   * Includes polling to wait for Toss to issue the account
   */
  async completeVirtualAccountRequest(
    userId: string,
    requestId: string,
  ): Promise<VirtualAccountCompletionResponseDto | { status: string; message: string }> {
    // Get the pending request
    const vaRequest = await this.vaRequestRepository.findOne({
      where: { id: requestId, userId },
    });

    if (!vaRequest) {
      throw new NotFoundException('Virtual account request not found');
    }

    if (vaRequest.status !== VirtualAccountRequestStatus.PENDING) {
      throw new BadRequestException(`Request status is ${vaRequest.status}, expected PENDING`);
    }

    try {
      // Poll for account details from Toss
      // Toss may take a few moments to issue the account after payment
      const accountDetails = await this.checkPaymentWithPolling(vaRequest.paymentKey);

      if (!accountDetails) {
        // Account still not issued after all retries
        this.logger.warn(
          `Virtual account still pending after polling for payment ${vaRequest.paymentKey}. Will try again shortly.`,
        );
        return {
          status: 'PENDING',
          message: 'Payment is processing. Please try again in a few moments. Toss Payments may take up to 1 minute to issue your account.',
        };
      }

      // Create the actual virtual account
      const virtualAccount = this.virtualAccountRepository.create({
        userId,
        accountNumber: accountDetails.accountNumber,
        accountName: accountDetails.accountName,
        bankCode: accountDetails.bankCode,
        bankName: accountDetails.bankName,
        status: VirtualAccountStatus.ACTIVE,
        availableBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        frozenBalance: 0,
      });

      const savedAccount = await this.virtualAccountRepository.save(virtualAccount);

      // Update the request to completed
      vaRequest.status = VirtualAccountRequestStatus.COMPLETED;
      vaRequest.virtualAccountId = savedAccount.id;
      vaRequest.completedAt = new Date();
      await this.vaRequestRepository.save(vaRequest);

      this.logger.log(
        `Virtual account ${savedAccount.accountNumber} created successfully for user ${userId}`,
      );

      return {
        id: savedAccount.id,
        userId: savedAccount.userId,
        accountNumber: savedAccount.accountNumber,
        accountName: savedAccount.accountName,
        status: savedAccount.status,
        availableBalance: savedAccount.availableBalance,
        bankCode: savedAccount.bankCode,
        bankName: savedAccount.bankName,
        createdAt: savedAccount.createdAt,
        completedAt: vaRequest.completedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to complete virtual account request ${requestId}:`, error);
      throw new BadRequestException(`Virtual account completion failed: ${errorMessage}`);
    }
  }

  /**
   * Check status of a virtual account request
   * Returns current status and updates DB if account has been approved
   * Can be called repeatedly by frontend to check if account is ready
   */
  async checkVirtualAccountRequestStatus(
    userId: string,
    requestId: string,
  ): Promise<
    | VirtualAccountCompletionResponseDto
    | { status: string; message: string; pendingSince?: Date; requiresUserAction: boolean }
  > {
    // Get the request
    const vaRequest = await this.vaRequestRepository.findOne({
      where: { id: requestId, userId },
    });

    if (!vaRequest) {
      throw new NotFoundException('Virtual account request not found');
    }

    // If already completed, return the account details
    if (vaRequest.status === VirtualAccountRequestStatus.COMPLETED) {
      if (!vaRequest.virtualAccountId) {
        throw new BadRequestException('Request marked as completed but no account found');
      }

      const account = await this.virtualAccountRepository.findOne({
        where: { id: vaRequest.virtualAccountId },
      });

      if (!account) {
        throw new NotFoundException('Virtual account not found');
      }

      return {
        id: account.id,
        userId: account.userId,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        status: account.status,
        availableBalance: account.availableBalance,
        bankCode: account.bankCode,
        bankName: account.bankName,
        createdAt: account.createdAt,
        completedAt: vaRequest.completedAt || new Date(),
      };
    }

    // Check payment status with Toss
    try {
      const accountDetails = await this.paymentGatewayService.getVirtualAccountFromPayment(
        vaRequest.paymentKey,
      );

      if (!accountDetails) {
        // Account still not issued
        this.logger.debug(
          `Virtual account still pending for payment ${vaRequest.paymentKey} (request ${requestId})`,
        );
        return {
          status: 'PENDING',
          message: 'Your virtual account is being processed. Toss Payments typically issues accounts within 1-2 minutes after payment.',
          pendingSince: vaRequest.createdAt,
          requiresUserAction: false,
        };
      }

      // Account has been issued! Create and save it
      const virtualAccount = this.virtualAccountRepository.create({
        userId,
        accountNumber: accountDetails.accountNumber,
        accountName: accountDetails.accountName,
        bankCode: accountDetails.bankCode,
        bankName: accountDetails.bankName,
        status: VirtualAccountStatus.ACTIVE,
        availableBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        frozenBalance: 0,
      });

      const savedAccount = await this.virtualAccountRepository.save(virtualAccount);

      // Update the request to completed
      vaRequest.status = VirtualAccountRequestStatus.COMPLETED;
      vaRequest.virtualAccountId = savedAccount.id;
      vaRequest.completedAt = new Date();
      await this.vaRequestRepository.save(vaRequest);

      this.logger.log(
        `Virtual account ${savedAccount.accountNumber} created successfully for user ${userId} (from status check)`,
      );

      return {
        id: savedAccount.id,
        userId: savedAccount.userId,
        accountNumber: savedAccount.accountNumber,
        accountName: savedAccount.accountName,
        status: savedAccount.status,
        availableBalance: savedAccount.availableBalance,
        bankCode: savedAccount.bankCode,
        bankName: savedAccount.bankName,
        createdAt: savedAccount.createdAt,
        completedAt: vaRequest.completedAt,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to check virtual account status for request ${requestId}:`, error);
      throw new BadRequestException(`Status check failed: ${errorMessage}`);
    }
  }

  /**
   * Get virtual account info for dashboard
   * Throws NotFoundException if account doesn't exist
   */
  async getVirtualAccountInfo(userId: string): Promise<VirtualAccountInfoDto> {
    const account = await this.getVirtualAccountIfExists(userId);
    if (!account) {
      throw new NotFoundException('Virtual account not found. Please create one first.');
    }

    return {
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      availableBalance: account.availableBalance,
      totalDeposited: account.totalDeposited,
      totalWithdrawn: account.totalWithdrawn,
      frozenBalance: account.frozenBalance,
      bankName: account.bankName,
      lastTransactionAt: account.lastTransactionAt,
    };
  }

  /**
   * Get any pending virtual account request for user
   * Returns the pending request if one exists, null otherwise
   */
  async getPendingVirtualAccountRequest(
    userId: string,
  ): Promise<{ id: string; requestId: string; status: string; message: string; pendingSince: Date } | null> {
    const pendingRequest = await this.vaRequestRepository.findOne({
      where: {
        userId,
        status: VirtualAccountRequestStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (!pendingRequest) {
      return null;
    }

    return {
      id: pendingRequest.id,
      requestId: pendingRequest.id,
      status: 'PENDING',
      message: 'Your virtual account is being processed. Toss Payments typically issues accounts within 1-2 minutes after payment.',
      pendingSince: pendingRequest.createdAt,
    };
  }

  /**
   * Confirm virtual account payment after user completes Toss checkout
   * Calls Toss to confirm payment and attempts to issue account
   */
  async confirmVirtualAccountPayment(
    userId: string,
    requestId: string,
  ): Promise<VirtualAccountCompletionResponseDto | { status: string; message: string; requiresUserAction: boolean; nextSteps?: string }> {
    // Get the pending request
    const vaRequest = await this.vaRequestRepository.findOne({
      where: { id: requestId, userId },
    });

    if (!vaRequest) {
      throw new NotFoundException('Virtual account request not found');
    }

    if (vaRequest.status !== VirtualAccountRequestStatus.PENDING) {
      // If already completed, return account details
      if (vaRequest.status === VirtualAccountRequestStatus.COMPLETED && vaRequest.virtualAccountId) {
        const account = await this.virtualAccountRepository.findOne({
          where: { id: vaRequest.virtualAccountId },
        });
        if (account) {
          return {
            id: account.id,
            userId: account.userId,
            accountNumber: account.accountNumber,
            accountName: account.accountName,
            status: account.status,
            availableBalance: account.availableBalance,
            bankCode: account.bankCode,
            bankName: account.bankName,
            createdAt: account.createdAt,
            completedAt: vaRequest.completedAt || new Date(),
          };
        }
      }
      throw new BadRequestException(`Request status is ${vaRequest.status}, expected PENDING`);
    }

    try {
      // Confirm payment with Toss
      const confirmationResult = await this.paymentGatewayService.confirmRepaymentPayment(
        vaRequest.paymentKey,
        vaRequest.orderId,
        vaRequest.amount,
      );

      this.logger.debug(
        `Payment confirmation result for ${vaRequest.paymentKey}: ${JSON.stringify(confirmationResult)}`,
      );

      // Check if virtual account is now available
      const accountDetails = await this.paymentGatewayService.getVirtualAccountFromPayment(
        vaRequest.paymentKey,
      );

      if (accountDetails) {
        // Account is ready - create it
        const virtualAccount = this.virtualAccountRepository.create({
          userId,
          accountNumber: accountDetails.accountNumber,
          accountName: accountDetails.accountName,
          bankCode: accountDetails.bankCode,
          bankName: accountDetails.bankName,
          status: VirtualAccountStatus.ACTIVE,
          availableBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          frozenBalance: 0,
        });

        const savedAccount = await this.virtualAccountRepository.save(virtualAccount);

        // Update request to completed
        vaRequest.status = VirtualAccountRequestStatus.COMPLETED;
        vaRequest.virtualAccountId = savedAccount.id;
        vaRequest.completedAt = new Date();
        await this.vaRequestRepository.save(vaRequest);

        this.logger.log(
          `Virtual account ${savedAccount.accountNumber} created successfully for user ${userId} (from confirmation)`,
        );

        return {
          id: savedAccount.id,
          userId: savedAccount.userId,
          accountNumber: savedAccount.accountNumber,
          accountName: savedAccount.accountName,
          status: savedAccount.status,
          availableBalance: savedAccount.availableBalance,
          bankCode: savedAccount.bankCode,
          bankName: savedAccount.bankName,
          createdAt: savedAccount.createdAt,
          completedAt: vaRequest.completedAt,
        };
      }

      // Account not yet issued - check if awaiting approval
      return {
        status: 'WAITING_DEPOSIT',
        message: 'Your payment is being processed. Please approve the virtual account creation in your Toss Payments dashboard.',
        requiresUserAction: true,
        nextSteps:
          'Visit Toss Payments dashboard to approve the virtual account. Once approved, your account will be automatically created.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to confirm virtual account payment for request ${requestId}:`, error);
      throw new BadRequestException(`Payment confirmation failed: ${errorMessage}`);
    }
  }

  /**
   * Record a deposit transaction
   */
  async recordDeposit(
    userId: string,
    depositDto: CreateDepositDto,
  ): Promise<VirtualAccountTransactionResponseDto> {
    const account = await this.getVirtualAccountIfExists(userId);
    if (!account) {
      throw new NotFoundException('Virtual account not found. Please create one first.');
    }

    if (account.status !== VirtualAccountStatus.ACTIVE) {
      throw new BadRequestException('Virtual account is not active');
    }

    const { amount, description, referenceNumber } = depositDto;

    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be positive');
    }

    const balanceBefore = account.availableBalance;
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    const transaction = this.transactionRepository.create({
      virtualAccountId: account.id,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.COMPLETED,
      balanceBefore,
      balanceAfter,
      description,
      referenceNumber,
      completedAt: new Date(),
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update account balance
    account.availableBalance = balanceAfter;
    account.totalDeposited += amount;
    account.lastTransactionAt = new Date();
    await this.virtualAccountRepository.save(account);

    return this.mapTransactionToResponseDto(savedTransaction);
  }

  /**
   * Record a withdrawal transaction
   */
  async recordWithdrawal(
    userId: string,
    withdrawalDto: CreateWithdrawalDto,
  ): Promise<VirtualAccountTransactionResponseDto> {
    const account = await this.getVirtualAccountIfExists(userId);
    if (!account) {
      throw new NotFoundException('Virtual account not found. Please create one first.');
    }

    if (account.status !== VirtualAccountStatus.ACTIVE) {
      throw new BadRequestException('Virtual account is not active');
    }

    const { amount, description } = withdrawalDto;

    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be positive');
    }

    if (amount > account.availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceBefore = account.availableBalance;
    const balanceAfter = balanceBefore - amount;

    // Create transaction
    const transaction = this.transactionRepository.create({
      virtualAccountId: account.id,
      type: TransactionType.WITHDRAWAL,
      amount,
      status: TransactionStatus.COMPLETED,
      balanceBefore,
      balanceAfter,
      description,
      completedAt: new Date(),
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update account balance
    account.availableBalance = balanceAfter;
    account.totalWithdrawn += amount;
    account.lastTransactionAt = new Date();
    await this.virtualAccountRepository.save(account);

    return this.mapTransactionToResponseDto(savedTransaction);
  }

  /**
   * Get deposit/withdrawal history
   */
  async getTransactionHistory(
    userId: string,
    limit = 10,
    offset = 0,
  ): Promise<DepositHistoryResponseDto> {
    const account = await this.getVirtualAccountIfExists(userId);
    if (!account) {
      throw new NotFoundException('Virtual account not found. Please create one first.');
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: {
        virtualAccountId: account.id,
        type: In([TransactionType.DEPOSIT, TransactionType.WITHDRAWAL]),
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const items = transactions.map((t) => ({
      id: t.id,
      date: t.createdAt.toISOString().split('T')[0],
      type: (t.type === TransactionType.DEPOSIT ? 'deposit' : 'withdrawal') as 'deposit' | 'withdrawal',
      amount: t.amount,
      status: (
        t.status === TransactionStatus.COMPLETED
          ? 'completed'
          : t.status === TransactionStatus.PENDING
          ? 'pending'
          : 'failed'
      ) as 'completed' | 'pending' | 'failed',
    }));

    const completed = transactions.filter((t) => t.status === TransactionStatus.COMPLETED).length;
    const pending = transactions.filter((t) => t.status === TransactionStatus.PENDING).length;
    const failed = transactions.filter((t) => t.status === TransactionStatus.FAILED).length;

    return {
      items,
      total,
      completed,
      pending,
      failed,
    };
  }

  /**
   * Freeze balance (when investment starts)
   */
  async freezeBalance(userId: string, amount: number): Promise<void> {
    const account = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Virtual account not found');
    }

    if (amount > account.availableBalance) {
      throw new BadRequestException('Insufficient available balance');
    }

    account.availableBalance -= amount;
    account.frozenBalance += amount;
    await this.virtualAccountRepository.save(account);
  }

  /**
   * Unfreeze balance (when investment is completed)
   */
  async unfreezeBalance(userId: string, amount: number): Promise<void> {
    const account = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Virtual account not found');
    }

    if (amount > account.frozenBalance) {
      throw new BadRequestException('Insufficient frozen balance');
    }

    account.frozenBalance -= amount;
    account.availableBalance += amount;
    await this.virtualAccountRepository.save(account);
  }

  /**
   * Generate unique account number
   */
  private generateAccountNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VA${timestamp}${random}`;
  }

  /**
   * Map VirtualAccount to ResponseDto
   */
  private mapToResponseDto(account: VirtualAccount): VirtualAccountResponseDto {
    return {
      id: account.id,
      userId: account.userId,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      status: account.status,
      availableBalance: account.availableBalance,
      totalDeposited: account.totalDeposited,
      totalWithdrawn: account.totalWithdrawn,
      frozenBalance: account.frozenBalance,
      bankCode: account.bankCode,
      bankName: account.bankName,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      lastTransactionAt: account.lastTransactionAt,
    };
  }

  /**
   * Map VirtualAccountTransaction to ResponseDto
   */
  private mapTransactionToResponseDto(
    transaction: VirtualAccountTransaction,
  ): VirtualAccountTransactionResponseDto {
    return {
      id: transaction.id,
      virtualAccountId: transaction.virtualAccountId,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      referenceNumber: transaction.referenceNumber,
      relatedParty: transaction.relatedParty,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
      failedAt: transaction.failedAt,
      failureReason: transaction.failureReason,
    };
  }
}
