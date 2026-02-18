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
    ]),
  ],
  providers: [LoansService],
  controllers: [LoansController],
  exports: [LoansService],
})
export class LoansModule {}
