/**
 * Intelligently format currency amounts based on their magnitude
 * - Less than 1,000: Shows raw won (원)
 * - 1,000 to 999,999: Shows thousands (천)
 * - 1,000,000 to 999,999,999: Shows millions (백만)
 * - 1,000,000,000+: Shows billions (억)
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return '₩0';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount < 1000) {
    // Show raw amount for small values
    return `₩${Math.round(amount).toLocaleString('ko-KR')}`;
  } else if (absAmount < 1000000) {
    // Show thousands (천)
    const thousands = amount / 1000;
    if (thousands === Math.floor(thousands)) {
      return `₩${Math.round(thousands).toLocaleString('ko-KR')}천`;
    }
    return `₩${thousands.toFixed(1)}천`;
  } else if (absAmount < 100000000) {
    // Show millions (백만)
    const millions = amount / 1000000;
    if (millions === Math.floor(millions)) {
      return `₩${Math.round(millions).toLocaleString('ko-KR')}백만`;
    }
    return `₩${millions.toFixed(1)}백만`;
  } else {
    // Show billions (억)
    const billions = amount / 100000000;
    if (billions === Math.floor(billions)) {
      return `₩${Math.round(billions).toLocaleString('ko-KR')}억`;
    }
    return `₩${billions.toFixed(1)}억`;
  }
}

/**
 * Format currency for shorthand display (only unit, no full formatting)
 * Useful for cards and compact displays
 */
export function formatCurrencyShort(amount: number): string {
  if (amount === 0) return '₩0';
  
  const absAmount = Math.abs(amount);
  
  if (absAmount < 1000) {
    return `₩${Math.round(amount)}`;
  } else if (absAmount < 1000000) {
    const thousands = amount / 1000;
    return thousands === Math.floor(thousands)
      ? `₩${Math.round(thousands)}천`
      : `₩${thousands.toFixed(1)}천`;
  } else if (absAmount < 100000000) {
    const millions = amount / 1000000;
    return millions === Math.floor(millions)
      ? `₩${Math.round(millions)}백만`
      : `₩${millions.toFixed(1)}백만`;
  } else {
    const billions = amount / 100000000;
    return billions === Math.floor(billions)
      ? `₩${Math.round(billions)}억`
      : `₩${billions.toFixed(1)}억`;
  }
}
