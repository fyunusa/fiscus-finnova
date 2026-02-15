// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// Mask sensitive data (주민번호, 계좌번호)
export const maskSSN = (ssn: string): string => {
  return ssn.replace(/(\d{6})(\d+)/, '$1-*****');
};

export const maskAccount = (account: string): string => {
  return account.replace(/(.{2})(.*)(.{4})/, '$1****$3');
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate phone
export const isValidPhone = (phone: string): boolean => {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone);
};
