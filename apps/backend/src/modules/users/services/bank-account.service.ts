import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { CreateBankAccountDto, BankAccountResponseDto } from '../dtos/bank-account.dto';
import { BankAccountStatus } from '../enums/bank-account.enum';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
  ) {}

  /**
   * Create a new bank account for user
   */
  async createBankAccount(
    userId: string,
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    // Check if user already has a bank account marked as default
    const existingDefault = await this.bankAccountRepository.findOne({
      where: { userId, isDefault: true },
    });

    // If no default exists, make this one default
    const isDefault = !existingDefault;

    const bankAccount = this.bankAccountRepository.create({
      userId,
      ...createBankAccountDto,
      status: BankAccountStatus.PENDING,
      isDefault,
    });

    const saved = await this.bankAccountRepository.save(bankAccount);
    return this.mapToResponseDto(saved);
  }

  /**
   * Get all bank accounts for user
   */
  async getBankAccountsByUserId(userId: string): Promise<BankAccountResponseDto[]> {
    const accounts = await this.bankAccountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return accounts.map(acc => this.mapToResponseDto(acc));
  }

  /**
   * Get default bank account for user
   */
  async getDefaultBankAccount(userId: string): Promise<BankAccountResponseDto> {
    const account = await this.bankAccountRepository.findOne({
      where: { userId, isDefault: true },
    });

    if (!account) {
      throw new NotFoundException('No default bank account found');
    }

    return this.mapToResponseDto(account);
  }

  /**
   * Update bank account status (e.g., pending to verified)
   */
  async updateBankAccountStatus(
    bankAccountId: string,
    userId: string,
    status: BankAccountStatus,
  ): Promise<BankAccountResponseDto> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    account.status = status;
    const saved = await this.bankAccountRepository.save(account);
    return this.mapToResponseDto(saved);
  }

  /**
   * Set a bank account as default
   */
  async setAsDefault(bankAccountId: string, userId: string): Promise<BankAccountResponseDto> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Remove default from other accounts
    await this.bankAccountRepository.update({ userId, isDefault: true }, { isDefault: false });

    // Set this one as default
    account.isDefault = true;
    const saved = await this.bankAccountRepository.save(account);
    return this.mapToResponseDto(saved);
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(bankAccountId: string, userId: string): Promise<void> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Don't allow deletion of default account
    if (account.isDefault) {
      throw new BadRequestException('Cannot delete default bank account');
    }

    await this.bankAccountRepository.remove(account);
  }

  private mapToResponseDto(account: BankAccount): BankAccountResponseDto {
    return {
      id: account.id,
      userId: account.userId,
      bankCode: account.bankCode,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      status: account.status,
      isDefault: account.isDefault,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
