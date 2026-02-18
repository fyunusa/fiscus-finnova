import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { KYCDocument } from '../entities/kyc-document.entity';
import { CreateKYCDocumentDto, ReviewKYCDocumentDto, KYCDocumentResponseDto } from '../dtos/kyc-document.dto';
import { KYCDocumentStatus, KYCDocumentType } from '../enums/kyc-document.enum';
import { MediaUploadService } from '../../external-api/services/media-upload.service';

@Injectable()
export class KYCDocumentService {
  constructor(
    @InjectRepository(KYCDocument)
    private kycDocumentRepository: Repository<KYCDocument>,
    private mediaUploadService: MediaUploadService,
  ) {}

  /**
   * Upload KYC documents (ID and selfie) for user
   */
  async uploadDocument(
    userId: string,
    files: {
      idDocument?: Express.Multer.File;
      selfieDocument?: Express.Multer.File;
    },
  ): Promise<KYCDocumentResponseDto[]> {
    if (!files.idDocument && !files.selfieDocument) {
      throw new BadRequestException('At least one document (ID or selfie) must be provided');
    }

    const uploadedDocuments: KYCDocumentResponseDto[] = [];

    // Upload ID document if provided
    if (files.idDocument) {
      const file = files.idDocument; // Assuming single file upload for each type
      const filePath = await this.mediaUploadService.uploadFile(
        file,
        'kyc-documents',
        'document',
        userId,
      );

      const document = this.kycDocumentRepository.create({
        userId,
        documentType: KYCDocumentType.ID_COPY,
        documentUrl: filePath,
        status: KYCDocumentStatus.PENDING,
      });

      const saved = await this.kycDocumentRepository.save(document);
      uploadedDocuments.push(this.mapToResponseDto(saved));
    }

    // Upload selfie document if provided
    if (files.selfieDocument) {
      const file = files.selfieDocument; // Assuming single file upload for each type
      const filePath = await this.mediaUploadService.uploadFile(
        file,
        'kyc-documents',
        'image',
        userId,
      );

      const document = this.kycDocumentRepository.create({
        userId,
        documentType: KYCDocumentType.SELFIE_WITH_ID,
        documentUrl: filePath,
        status: KYCDocumentStatus.PENDING,
      });

      const saved = await this.kycDocumentRepository.save(document);
      uploadedDocuments.push(this.mapToResponseDto(saved));
    }

    return uploadedDocuments;
  }

  /**
   * Get all KYC documents for user
   */
  async getDocumentsByUserId(userId: string): Promise<KYCDocumentResponseDto[]> {
    const documents = await this.kycDocumentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return documents.map(doc => this.mapToResponseDto(doc));
  }

  /**
   * Get a specific KYC document
   */
  async getDocumentById(documentId: string, userId: string): Promise<KYCDocumentResponseDto> {
    const document = await this.kycDocumentRepository.findOne({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new NotFoundException('KYC document not found');
    }

    return this.mapToResponseDto(document);
  }

  /**
   * Admin reviews and approves/rejects KYC document
   */
  async reviewDocument(
    documentId: string,
    reviewKYCDocumentDto: ReviewKYCDocumentDto,
    adminUserId: string,
  ): Promise<KYCDocumentResponseDto> {
    const document = await this.kycDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('KYC document not found');
    }

    document.status = reviewKYCDocumentDto.status;
    document.rejectionReason = reviewKYCDocumentDto.rejectionReason || undefined;
    document.adminReviewedBy = adminUserId;
    document.adminReviewedAt = new Date();

    const saved = await this.kycDocumentRepository.save(document);
    return this.mapToResponseDto(saved);
  }

  /**
   * Check if all required KYC documents are approved
   */
  async areAllDocumentsApproved(userId: string): Promise<boolean> {
    const pendingOrRejected = await this.kycDocumentRepository.count({
      where: [
        { userId, status: KYCDocumentStatus.PENDING },
        { userId, status: KYCDocumentStatus.REJECTED },
        { userId, status: KYCDocumentStatus.SUPPLEMENT },
      ],
    });

    return pendingOrRejected === 0;
  }

  private mapToResponseDto(document: KYCDocument): KYCDocumentResponseDto {
    return {
      id: document.id,
      userId: document.userId,
      documentType: document.documentType,
      documentUrl: document.documentUrl,
      status: document.status,
      rejectionReason: document.rejectionReason,
      adminReviewedBy: document.adminReviewedBy,
      adminReviewedAt: document.adminReviewedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
