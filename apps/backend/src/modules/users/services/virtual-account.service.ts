import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { VirtualAccount } from '../entities/virtual-account.entity';
import { VirtualAccountTransaction } from '../entities/virtual-account-transaction.entity';
import {
  CreateDepositDto,
  CreateWithdrawalDto,
  VirtualAccountResponseDto,
  VirtualAccountTransactionResponseDto,
  DepositHistoryResponseDto,
  VirtualAccountInfoDto,
} from '../dtos/virtual-account.dto';
import {
  VirtualAccountStatus,
  TransactionType,
  TransactionStatus,
} from '../enums/virtual-account.enum';
import { User } from '../entities/user.entity';

@Injectable()
export class VirtualAccountService {
  constructor(
    @InjectRepository(VirtualAccount)
    private readonly virtualAccountRepository: Repository<VirtualAccount>,
    @InjectRepository(VirtualAccountTransaction)
    private readonly transactionRepository: Repository<VirtualAccountTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Private helper: Ensure virtual account exists, create if needed
   * Returns the entity (not DTO)
   */
  private async ensureVirtualAccount(userId: string): Promise<VirtualAccount> {
    let account = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (!account) {
      // Generate unique account number
      const accountNumber = this.generateAccountNumber();
      
      const virtualAccount = this.virtualAccountRepository.create({
        userId,
        accountNumber,
        accountName: 'Fiscus Investment Account',
        status: VirtualAccountStatus.ACTIVE,
        availableBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        frozenBalance: 0,
      });

      account = await this.virtualAccountRepository.save(virtualAccount);
    }

    return account;
  }

  /**
   * Create a virtual account for a new user on signup
   */
  async createVirtualAccountForUser(userId: string): Promise<VirtualAccountResponseDto> {
    // Check if user already has a virtual account
    const existingAccount = await this.virtualAccountRepository.findOne({
      where: { userId },
    });

    if (existingAccount) {
      throw new ConflictException('User already has a virtual account');
    }

    // Generate unique account number (e.g., VA-{timestamp}-{random})
    const accountNumber = this.generateAccountNumber();

    const virtualAccount = this.virtualAccountRepository.create({
      userId,
      accountNumber,
      accountName: 'Fiscus Investment Account',
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
   * Get user's virtual account
   */
  async getVirtualAccount(userId: string): Promise<VirtualAccountResponseDto> {
    const account = await this.ensureVirtualAccount(userId);
    return this.mapToResponseDto(account);
  }

  /**
   * Get virtual account info for dashboard
   */
  async getVirtualAccountInfo(userId: string): Promise<VirtualAccountInfoDto> {
    const account = await this.ensureVirtualAccount(userId);

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
   * Record a deposit transaction
   */
  async recordDeposit(
    userId: string,
    depositDto: CreateDepositDto,
  ): Promise<VirtualAccountTransactionResponseDto> {
    const account = await this.ensureVirtualAccount(userId);

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
    const account = await this.ensureVirtualAccount(userId);

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
    const account = await this.ensureVirtualAccount(userId);

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
