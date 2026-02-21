import { CreateInquiryDto } from '../dtos/create-inquiry.dto';
import {
  InquiryCategoryEnum,
  InquiryStatusEnum,
  InquiryPriorityEnum,
} from '@common/enums/inquiry.enum';

export interface InquirySeedData extends CreateInquiryDto {
  status: InquiryStatusEnum;
  repliesCount: number;
  lastReplyBy?: string;
}

export const SEED_INQUIRIES: InquirySeedData[] = [
  {
    subject: '투자금 출금이 안 됩니다',
    category: InquiryCategoryEnum.INVESTMENT,
    priority: InquiryPriorityEnum.HIGH,
    message: `안녕하세요,

어제 신청한 투자금 100만원이 아직 출금되지 않았습니다. 계좌 확인을 부탁드립니다.

신청 정보:
- 신청일: 2026-02-13 15:30
- 금액: 1,000,000원
- 출금 계좌: 신한은행 xxx-xxx-xxxx

빠른 처리 부탁드립니다.`,
    status: InquiryStatusEnum.PENDING,
    repliesCount: 2,
    lastReplyBy: '담당자',
  },
  {
    subject: '로그인 비밀번호 리셋이 필요합니다',
    category: InquiryCategoryEnum.ACCOUNT,
    priority: InquiryPriorityEnum.HIGH,
    message: `비밀번호를 잊어버려서 리셋이 필요합니다. 메일로 리셋 링크를 보내주세요.

등록된 이메일: user@example.com
가입일: 2025-01-15`,
    status: InquiryStatusEnum.OPEN,
    repliesCount: 1,
    lastReplyBy: '자동',
  },
  {
    subject: '투자 상품이 궁금합니다',
    category: InquiryCategoryEnum.INVESTMENT,
    priority: InquiryPriorityEnum.LOW,
    message: `강남 오피스텔 담보대출 상품에 대해 문의드립니다.

몇 가지 궁금한 점이 있습니다:
1. LTV 70%는 어떻게 계산되나요?
2. 월정 배당금 지급은 언제인가요?
3. 조기 상환 시 수수료가 있나요?

자세한 설명 부탁드립니다.`,
    status: InquiryStatusEnum.CLOSED,
    repliesCount: 3,
    lastReplyBy: '담당자',
  },
  {
    subject: '앱이 자꾸 강제종료됩니다',
    category: InquiryCategoryEnum.TECHNICAL,
    priority: InquiryPriorityEnum.MEDIUM,
    message: `iOS 앱이 투자 페이지에서 자꾸 강제종료됩니다.

정보:
- 기기: iPhone 14
- iOS 버전: 17.3
- 앱 버전: 2.4.1
- 발생 상황: 특정 투자 상품 클릭 시

최근 앱 업데이트 후 문제가 생겼습니다.`,
    status: InquiryStatusEnum.PENDING,
    repliesCount: 1,
    lastReplyBy: '담당자',
  },
  {
    subject: '대출 신청 서류 제출',
    category: InquiryCategoryEnum.LOAN,
    priority: InquiryPriorityEnum.MEDIUM,
    message: `대출 신청에 필요한 서류가 뭔가요?

부동산담보대출을 신청하려고 합니다. 어떤 서류를 준비해야 하나요?

- 증명 사진
- 신분증
- 기타?

상세 리스트를 부탁드립니다.`,
    status: InquiryStatusEnum.OPEN,
    repliesCount: 1,
    lastReplyBy: '자동',
  },
];
