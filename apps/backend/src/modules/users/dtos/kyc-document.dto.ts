import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Express } from 'express';
import { KYCDocumentType, KYCDocumentStatus } from '../enums/kyc-document.enum';

export class CreateKYCDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ID document file (PNG, JPG, JPEG, GIF, WebP, SVG, PDF)',
    required: false,
  })
  @IsOptional()
  idDocument?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Selfie document file (PNG, JPG, JPEG, GIF, WebP, SVG)',
    required: false,
  })
  @IsOptional()
  selfieDocument?: Express.Multer.File;
}

export class ReviewKYCDocumentDto {
  @IsEnum(KYCDocumentStatus)
  status!: KYCDocumentStatus;
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class KYCDocumentResponseDto {
  id!: string;
  userId!: string;
  documentType!: string;
  documentUrl!: string;
  status!: string;
  rejectionReason?: string;
  adminReviewedBy?: string;
  adminReviewedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
