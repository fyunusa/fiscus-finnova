import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LoanProduct,
  LoanApplication,
  LoanApplicationDocument,
  LoanAccount,
  LoanRepaymentSchedule,
  LoanRepaymentTransaction,
  LoanConsultation,
} from './entities';
import { LoansService } from './services/loans.service';
import { LoansController } from './controllers/loans.controller';
import { WebhookController } from './controllers/webhook.controller';
import { VirtualAccount } from '@modules/users/entities/virtual-account.entity';
import { User } from '@modules/users/entities/user.entity';
import { ExternalApiModule } from '@modules/external-api/external-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanProduct,
      LoanApplication,
      LoanApplicationDocument,
      LoanAccount,
      LoanRepaymentSchedule,
      LoanRepaymentTransaction,
      LoanConsultation,
      VirtualAccount,
      User,
    ]),
    ExternalApiModule,
  ],
  providers: [LoansService],
  controllers: [LoansController, WebhookController],
  exports: [LoansService],
})
export class LoansModule {}
