import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BankAccount } from './entities/bank-account.entity';
import { KYCDocument } from './entities/kyc-document.entity';
import { TransactionPIN } from './entities/transaction-pin.entity';
import { VirtualAccount } from './entities/virtual-account.entity';
import { VirtualAccountTransaction } from './entities/virtual-account-transaction.entity';
import { VirtualAccountRequest } from './entities/virtual-account-request.entity';
import { UsersService } from './services/users.service';
import { BankAccountService } from './services/bank-account.service';
import { KYCDocumentService } from './services/kyc-document.service';
import { TransactionPINService } from './services/transaction-pin.service';
import { VirtualAccountService } from './services/virtual-account.service';
import { UsersController } from './controllers/users.controller';
import { VirtualAccountController } from './controllers/virtual-account.controller';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      BankAccount,
      KYCDocument,
      TransactionPIN,
      VirtualAccount,
      VirtualAccountTransaction,
      VirtualAccountRequest,
    ]),
    ExternalApiModule,
  ],
  controllers: [UsersController, VirtualAccountController],
  providers: [
    UsersService,
    BankAccountService,
    KYCDocumentService,
    TransactionPINService,
    VirtualAccountService,
  ],
  exports: [
    UsersService,
    BankAccountService,
    KYCDocumentService,
    TransactionPINService,
    VirtualAccountService,
  ],
})
export class UsersModule {}
