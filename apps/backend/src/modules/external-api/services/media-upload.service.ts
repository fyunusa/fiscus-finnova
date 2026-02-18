import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import type { Express } from 'express';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';

@Injectable()
export class MediaUploadService {
  private readonly uploadFolder = './uploads';
  private s3Client: S3Client | null = null;
  private s3Bucket: string | null = null;
  private appEnv: string;

  constructor() {
    this.appEnv = process.env.APP_ENV || 'local';
    // Ensure the upload folder exists
    fsPromises.mkdir(this.uploadFolder, { recursive: true }).catch(() => {});
  }

  async onModuleInit() {
    if (this.appEnv !== 'local') {
      try {
        this.s3Client = new S3Client({
          region: process.env.AWS_REGION || process.env.AWS_NORTH_REGION_2,
          ...(this.appEnv === 'local' && {
            credentials: fromIni({ profile: process.env.AWS_PROFILE || 'pipeline' }),
          }),
        });
        this.s3Bucket = process.env.AWS_BUCKET_NAME || 'dev-fiscus-static-content';
      } catch (error) {
        console.warn('S3 client initialization failed, falling back to local storage', error);
        this.s3Client = null;
      }
    }
  }

  /**
   * Upload file to local directory or S3 based on environment
   * @param file Multer file object
   * @param moduleDir Directory name for organization (e.g., 'kyc-documents', 'inquiries')
   * @param type File type ('image' or 'document')
   * @param userId Optional user ID for organization
   * @returns File path or S3 URL
   */
  async uploadFile(
    file: Express.Multer.File,
    moduleDir: string,
    type: 'image' | 'document',
    userId?: string,
  ): Promise<string> {
    if (this.appEnv !== 'local' && this.s3Client && this.s3Bucket) {
      return this.uploadToS3(file, moduleDir, type, userId);
    }
    return this.uploadImage(file, moduleDir, type, userId);
  }

  /**
   * Upload image/document to local directory
   */
  async uploadImage(
    file: Express.Multer.File,
    moduleDir: string,
    type: 'image' | 'document',
    userId?: string,
  ): Promise<string> {
    if (!file || !file.buffer || !file.originalname) {
      throw new BadRequestException('Invalid file provided');
    }

    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = {
      image: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      document: [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.svg',
        '.zip',
        '.pdf',
        '.doc',
        '.docx',
        '.hwp',
        '.txt',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
      ],
    };

    const validExtensions = allowedExtensions[type];

    if (!validExtensions.includes(extension)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${validExtensions.join(', ')}`,
      );
    }

    const baseName = path.basename(file.originalname, extension);

    // Sanitize filename
    const safeFileName = baseName
      .normalize('NFC')
      .replace(/[\s-]+/g, '_')
      .replace(/[^\p{Letter}\p{Number}_]+/gu, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Build directory path
    let modulePath = path.join(this.uploadFolder, moduleDir);
    if (userId) {
      modulePath = path.join(modulePath, userId);
    }

    // Ensure directory exists
    await fsPromises.mkdir(modulePath, { recursive: true });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${safeFileName}-${timestamp}${extension}`;
    const filePath = path.join(modulePath, filename);

    // Write file to disk
    await fsPromises.writeFile(filePath, file.buffer);

    // Return relative path
    if (userId) {
      return `${moduleDir}/${userId}/${filename}`;
    }
    return `${moduleDir}/${filename}`;
  }

  /**
   * Upload file to S3
   */
  async uploadToS3(
    file: Express.Multer.File,
    moduleDir: string,
    type: 'image' | 'document',
    userId?: string,
  ): Promise<string> {
    if (!this.s3Client || !this.s3Bucket) {
      throw new BadRequestException('S3 not configured, unable to upload');
    }

    try {
      if (!file || !file.buffer || !file.originalname) {
        throw new BadRequestException('Invalid file provided');
      }

      const extension = path.extname(file.originalname).toLowerCase();

      const allowedExtensions = {
        image: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
        document: [
          '.png',
          '.jpg',
          '.jpeg',
          '.gif',
          '.webp',
          '.svg',
          '.zip',
          '.pdf',
          '.doc',
          '.docx',
          '.hwp',
          '.txt',
          '.xls',
          '.xlsx',
          '.ppt',
          '.pptx',
        ],
      };

      const validExtensions = allowedExtensions[type];

      if (!validExtensions.includes(extension)) {
        throw new BadRequestException(
          `Unsupported file type. Allowed: ${validExtensions.join(', ')}`,
        );
      }

      const baseName = path.basename(file.originalname, extension);

      const safeFileName = baseName
        .normalize('NFC')
        .replace(/[\s-]+/g, '_')
        .replace(/[^\p{Letter}\p{Number}_]+/gu, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

      const timestamp = Date.now();
      let s3Key = `${moduleDir}/${safeFileName}-${timestamp}${extension}`;

      if (userId) {
        s3Key = `${moduleDir}/${userId}/${safeFileName}-${timestamp}${extension}`;
      }

      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return `https://${this.s3Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (this.appEnv !== 'local' && this.s3Client && this.s3Bucket) {
      return this.deleteFromS3(filePath);
    }
    return this.deleteLocalFile(filePath);
  }

  /**
   * Delete file from local storage
   */
  async deleteLocalFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadFolder, filePath);
      await fsPromises.access(fullPath);
      await fsPromises.unlink(fullPath);
    } catch {
      // File might already be deleted, ignore
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFromS3(s3Key: string): Promise<void> {
    if (!this.s3Client || !this.s3Bucket) {
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.warn('Error deleting from S3:', error);
    }
  }

  /**
   * Get the full filesystem path for a local file
   */
  getFullPath(filePath: string): string {
    return path.join(this.uploadFolder, filePath);
  }
}
