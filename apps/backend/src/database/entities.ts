/**
 * Centralized entity exports
 * All entities should be imported and exported here
 * This allows for easy management - add new entities only in this file
 * Then import from this file in ormconfig.ts and app.module.ts
 */

import { User } from '@modules/users/entities/user.entity';
import { BankAccount } from '@modules/users/entities/bank-account.entity';
import { KYCDocument } from '@modules/users/entities/kyc-document.entity';
import { TransactionPIN } from '@modules/users/entities/transaction-pin.entity';
import { VirtualAccount } from '@modules/users/entities/virtual-account.entity';
import { VirtualAccountTransaction } from '@modules/users/entities/virtual-account-transaction.entity';
import { VirtualAccountRequest } from '@modules/users/entities/virtual-account-request.entity';
import { PasswordResetOTP } from '@modules/auth/entities/password-reset-otp.entity';
import { EmailVerification } from '@modules/auth/entities/email-verification.entity';
import { PhoneVerification } from '@modules/auth/entities/sms-verification-code.entity';
import { Investment } from '@modules/investments/entities/investment.entity';
import { UserInvestment } from '@modules/investments/entities/user-investment.entity';
import { UserFavoriteInvestment } from '@modules/investments/entities/user-favorite-investment.entity';
import {
  LoanProduct,
  LoanApplication,
  LoanApplicationDocument,
  LoanAccount,
  LoanRepaymentSchedule,
  LoanRepaymentTransaction,
  LoanConsultation,
} from '@modules/loans/entities';
import { Inquiry } from '@modules/inquiry/entities/inquiry.entity';
import { InquiryComment } from '@modules/inquiry/entities/inquiry-comment.entity';

// Re-export all entities
export {
  User,
  BankAccount,
  KYCDocument,
  TransactionPIN,
  VirtualAccount,
  VirtualAccountTransaction,
  VirtualAccountRequest,
  PasswordResetOTP,
  EmailVerification,
  PhoneVerification,
  Investment,
  UserInvestment,
  UserFavoriteInvestment,
  LoanProduct,
  LoanApplication,
  LoanApplicationDocument,
  LoanAccount,
  LoanRepaymentSchedule,
  LoanRepaymentTransaction,
  LoanConsultation,
  Inquiry,
  InquiryComment,
};

// Collection array for easy use in TypeORM configuration
export const ALL_ENTITIES = [
  User,
  BankAccount,
  KYCDocument,
  TransactionPIN,
  VirtualAccount,
  VirtualAccountRequest,
  VirtualAccountTransaction,
  PasswordResetOTP,
  EmailVerification,
  PhoneVerification,
  Investment,
  UserInvestment,
  UserFavoriteInvestment,
  LoanProduct,
  LoanApplication,
  LoanApplicationDocument,
  LoanAccount,
  LoanRepaymentSchedule,
  LoanRepaymentTransaction,
  LoanConsultation,
  Inquiry,
  InquiryComment,
];

// Export services (in case we need centralized service management)
export { EmailService } from '@modules/external-api/services/email.service';
export { SmsService } from '@modules/external-api/services/sms.service';
