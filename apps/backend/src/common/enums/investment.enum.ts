/**
 * Investment type enumeration
 * Defines the different types of investments available on the platform
 */
export enum InvestmentTypeEnum {
  APARTMENT = 'apartment',
  CREDIT_CARD = 'credit-card',
  BUSINESS_LOAN = 'business-loan',
}

/**
 * Investment status enumeration
 * Defines the lifecycle status of an investment
 */
export enum InvestmentStatusEnum {
  RECRUITING = 'recruiting', // Open to new investors
  FUNDING = 'funding', // Currently being funded
  ENDING_SOON = 'ending-soon', // Funding deadline approaching
  CLOSED = 'closed', // Funding completed, no longer accepting investments
}

/**
 * User investment status enumeration
 * Tracks the status of individual user investments
 */
export enum UserInvestmentStatusEnum {
  PENDING = 'pending', // Awaiting confirmation
  CONFIRMED = 'confirmed', // Investment confirmed
  COMPLETED = 'completed', // Investment period ended, matured
  FAILED = 'failed', // Investment failed, funds returned
  CANCELLED = 'cancelled', // User cancelled investment
}

/**
 * Risk level enumeration
 * Defines the risk profile of an investment
 */
export enum RiskLevelEnum {
  LOW = 'low', // Low risk investments
  MEDIUM = 'medium', // Medium risk investments
  HIGH = 'high', // High risk investments
}

