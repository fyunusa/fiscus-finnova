import { LoanProduct } from '../entities/loan-product.entity';
import { LoanProductType, RepaymentMethod } from '../enums/loan.enum';

export const SEED_LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: '아파트 담보 대출',
    description: '아파트를 담보로 제공하는 담보대출 상품입니다. 최대 LTV 70%, 금리 7-10%',
    productType: LoanProductType.APARTMENT,
    maxLTV: 70,
    minInterestRate: 7.0,
    maxInterestRate: 10.0,
    minLoanAmount: 50,
    maxLoanAmount: 500000000, // 5억원
    minLoanPeriod: 12, // 12개월
    maxLoanPeriod: 30, // 30개월
    repaymentMethod: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
    isActive: true,
    requiredDocuments: ['id_copy', 'property_deed', 'financial_statement'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: '건물 담보 대출',
    description: '건물을 담보로 제공하는 담보대출 상품입니다. 최대 LTV 65%, 금리 6.5-9.5%',
    productType: LoanProductType.BUILDING,
    maxLTV: 65,
    minInterestRate: 6.5,
    maxInterestRate: 9.5,
    minLoanAmount: 50,
    maxLoanAmount: 1000000000, // 10억원
    minLoanPeriod: 12,
    maxLoanPeriod: 36, // 36개월
    repaymentMethod: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
    isActive: true,
    requiredDocuments: ['id_copy', 'property_deed', 'financial_statement', 'bank_statement'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: '신용대출',
    description: '개인신용도를 기반으로 하는 신용대출 상품입니다. 별도 담보 불필요. 최대 1억원까지 신청 가능',
    productType: LoanProductType.CREDIT,
    maxLTV: 100, // 신용대출은 LTV 개념이 없으므로 100으로 설정
    minInterestRate: 8.0,
    maxInterestRate: 15.0,
    minLoanAmount: 50,
    maxLoanAmount: 100000000, // 1억원
    minLoanPeriod: 6,
    maxLoanPeriod: 24,
    repaymentMethod: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
    isActive: true,
    requiredDocuments: ['id_copy', 'financial_statement', 'employment_letter', 'tax_return'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: '사업자 대출',
    description: '중소기업 및 자영업자를 위한 사업자금 대출입니다. 금리 5.5-8.5%',
    productType: LoanProductType.BUSINESS_LOAN,
    maxLTV: 80,
    minInterestRate: 5.5,
    maxInterestRate: 8.5,
    minLoanAmount: 50,
    maxLoanAmount: 500000000, // 5억원
    minLoanPeriod: 12,
    maxLoanPeriod: 36,
    repaymentMethod: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
    isActive: true,
    requiredDocuments: [
      'id_copy',
      'financial_statement',
      'employment_letter',
      'tax_return',
      'bank_statement',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: '무담보 할부금융',
    description: '별도 담보 없이 신용으로 진행하는 할부금융 상품입니다. 금리 6.0-12.0%',
    productType: LoanProductType.UNSECURED,
    maxLTV: 100,
    minInterestRate: 6.0,
    maxInterestRate: 12.0,
    minLoanAmount: 50,
    maxLoanAmount: 50000000, // 5천만원
    minLoanPeriod: 6,
    maxLoanPeriod: 18,
    repaymentMethod: RepaymentMethod.EQUAL_PRINCIPAL_INTEREST,
    isActive: true,
    requiredDocuments: ['id_copy', 'financial_statement'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any,
];
