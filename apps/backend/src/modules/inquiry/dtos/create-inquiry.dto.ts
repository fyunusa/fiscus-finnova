import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InquiryCategoryEnum, InquiryPriorityEnum } from '@common/enums/inquiry.enum';

export class CreateInquiryDto {
  @ApiProperty({ example: '투자금 출금이 안 됩니다' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: '어제 신청한 투자금 100만원이 아직 출금되지 않았습니다.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ enum: InquiryCategoryEnum, example: InquiryCategoryEnum.INVESTMENT })
  @IsEnum(InquiryCategoryEnum)
  category!: InquiryCategoryEnum;

  @ApiProperty({ enum: InquiryPriorityEnum, example: InquiryPriorityEnum.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(InquiryPriorityEnum)
  priority?: InquiryPriorityEnum;
}
