import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  InquiryCategoryEnum,
  InquiryPriorityEnum,
  InquiryStatusEnum,
} from '@common/enums/inquiry.enum';

export class UpdateInquiryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: InquiryCategoryEnum, required: false })
  @IsOptional()
  @IsEnum(InquiryCategoryEnum)
  category?: InquiryCategoryEnum;

  @ApiProperty({ enum: InquiryPriorityEnum, required: false })
  @IsOptional()
  @IsEnum(InquiryPriorityEnum)
  priority?: InquiryPriorityEnum;

  @ApiProperty({ enum: InquiryStatusEnum, required: false })
  @IsOptional()
  @IsEnum(InquiryStatusEnum)
  status?: InquiryStatusEnum;
}
