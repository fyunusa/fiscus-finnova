import { Injectable } from '@nestjs/common';

export interface FeatureFlags {
  websocketEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  paymentEnabled: boolean;
  investmentEnabled: boolean;
  loanEnabled: boolean;
  [key: string]: boolean;
}

@Injectable()
export class FeatureFlagsService {
  private flags!: FeatureFlags;

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags() {
    this.flags = {
      websocketEnabled: this.parseBoolean(process.env.FEATURE_WEBSOCKET_ENABLED, true),
      smsEnabled: this.parseBoolean(process.env.FEATURE_SMS_ENABLED, true),
      emailEnabled: this.parseBoolean(process.env.FEATURE_EMAIL_ENABLED, true),
      paymentEnabled: this.parseBoolean(process.env.FEATURE_PAYMENT_ENABLED, true),
      investmentEnabled: this.parseBoolean(process.env.FEATURE_INVESTMENT_ENABLED, true),
      loanEnabled: this.parseBoolean(process.env.FEATURE_LOAN_ENABLED, true),
    };
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true;
  }

  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false;
  }

  toggle(flag: keyof FeatureFlags): boolean {
    this.flags[flag] = !this.flags[flag];
    return this.flags[flag];
  }

  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
  }
}
