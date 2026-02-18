import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TransactionPIN } from '../entities/transaction-pin.entity';
import { SetTransactionPINDto, TransactionPINResponseDto } from '../dtos/transaction-pin.dto';

@Injectable()
export class TransactionPINService {
  constructor(
    @InjectRepository(TransactionPIN)
    private transactionPINRepository: Repository<TransactionPIN>,
  ) {}

  /**
   * Set or update transaction PIN for user
   */
  async setTransactionPIN(userId: string, setTransactionPINDto: SetTransactionPINDto): Promise<TransactionPINResponseDto> {
    // Hash the PIN using bcrypt
    const pinHash = await bcrypt.hash(setTransactionPINDto.pin, 10);

    // Check if user already has a PIN
    let pin = await this.transactionPINRepository.findOne({
      where: { userId },
    });

    if (pin) {
      // Update existing PIN
      pin.pinHash = pinHash;
      pin.failedAttempts = 0;
      pin.lockedUntil = undefined;
    } else {
      // Create new PIN
      pin = this.transactionPINRepository.create({
        userId,
        pinHash,
        isActive: true,
        failedAttempts: 0,
      });
    }

    const saved = await this.transactionPINRepository.save(pin);
    return this.mapToResponseDto(saved);
  }

  /**
   * Verify PIN for transaction
   */
  async verifyPIN(userId: string, pin: string): Promise<boolean> {
    const transactionPin = await this.transactionPINRepository.findOne({
      where: { userId },
    });

    if (!transactionPin) {
      throw new NotFoundException('Transaction PIN not set');
    }

    if (!transactionPin.isActive) {
      throw new BadRequestException('PIN is inactive');
    }

    // Check if PIN is locked due to failed attempts
    if (transactionPin.lockedUntil && transactionPin.lockedUntil > new Date()) {
      throw new BadRequestException('PIN is temporarily locked. Please try again later.');
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, transactionPin.pinHash);

    if (isValid) {
      // Reset failed attempts on successful verification
      transactionPin.failedAttempts = 0;
      transactionPin.lockedUntil = undefined;
    } else {
      // Increment failed attempts
      transactionPin.failedAttempts += 1;

      // Lock PIN if too many failed attempts (e.g., 5 attempts)
      if (transactionPin.failedAttempts >= 5) {
        transactionPin.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
    }

    await this.transactionPINRepository.save(transactionPin);

    return isValid;
  }

  /**
   * Get PIN status for user
   */
  async getPINStatus(userId: string): Promise<TransactionPINResponseDto> {
    const pin = await this.transactionPINRepository.findOne({
      where: { userId },
    });

    if (!pin) {
      throw new NotFoundException('Transaction PIN not set');
    }

    return this.mapToResponseDto(pin);
  }

  /**
   * Check if user has set a PIN
   */
  async hasPIN(userId: string): Promise<boolean> {
    const pin = await this.transactionPINRepository.findOne({
      where: { userId },
    });

    return !!pin;
  }

  /**
   * Deactivate PATH (admin function)
   */
  async deactivatePIN(userId: string): Promise<void> {
    const pin = await this.transactionPINRepository.findOne({
      where: { userId },
    });

    if (!pin) {
      throw new NotFoundException('Transaction PIN not set');
    }

    pin.isActive = false;
    await this.transactionPINRepository.save(pin);
  }

  private mapToResponseDto(pin: TransactionPIN): TransactionPINResponseDto {
    return {
      id: pin.id,
      userId: pin.userId,
      isActive: pin.isActive,
      createdAt: pin.createdAt,
      updatedAt: pin.updatedAt,
    };
  }
}
