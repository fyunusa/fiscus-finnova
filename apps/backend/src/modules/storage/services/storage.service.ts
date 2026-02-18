import { Injectable, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as minio from 'minio';
import type { UploadedFile } from '@nestjs/common';

export interface FileUploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  private s3Client!: AWS.S3;
  private minioClient!: minio.Client;
  private useLocal = true; // Set to false for S3

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // MinIO for local development
    try {
      const minioEndpoint = process.env.MINIO_ENDPOINT || 'minio:9000';
      const endpoint = minioEndpoint.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
      const port = parseInt(minioEndpoint.match(/:(\d+)$/)?.[1] || '9000', 10);
      
      this.minioClient = new minio.Client({
        endPoint: endpoint,
        port: port,
        useSSL: process.env.MINIO_ENDPOINT?.startsWith('https://') ? true : false,
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      });
    } catch (error) {
      console.error('MinIO initialization error:', error instanceof Error ? error.message : String(error));
    }

    // AWS S3 for production
    this.s3Client = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-northeast-2',
    });
  }

  async uploadFile(file: any, folder = 'documents'): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const bucket = process.env.MINIO_ACCESS_KEY === 'minioadmin' 
      ? 'fiscus-dev' 
      : process.env.AWS_S3_BUCKET || 'fiscus-documents-dev';

    try {
      if (this.useLocal) {
        return await this.uploadToMinIO(file, fileName, bucket);
      } else {
        return await this.uploadToS3(file, fileName, bucket);
      }
    } catch (error: any) {
      throw new BadRequestException(`File upload failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private async uploadToMinIO(
    file: any,
    fileName: string,
    bucket: string,
  ): Promise<FileUploadResult> {
    await this.minioClient.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const url = await this.minioClient.presignedGetObject(bucket, fileName, 24 * 60 * 60);

    return {
      url,
      key: fileName,
      bucket,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  private async uploadToS3(
    file: any,
    fileName: string,
    bucket: string,
  ): Promise<FileUploadResult> {
    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3Client.upload(params).promise();

    return {
      url: result.Location!,
      key: result.Key!,
      bucket: result.Bucket!,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const bucket = process.env.MINIO_ACCESS_KEY === 'minioadmin' 
      ? 'fiscus-dev' 
      : process.env.AWS_S3_BUCKET || 'fiscus-documents-dev';

    try {
      if (this.useLocal) {
        await this.minioClient.removeObject(bucket, key);
      } else {
        await this.s3Client
          .deleteObject({
            Bucket: bucket,
            Key: key,
          })
          .promise();
      }
    } catch (error: any) {
      throw new BadRequestException(`File deletion failed: ${error?.message || 'Unknown error'}`);
    }
  }

  async getFileUrl(key: string, expirySeconds = 3600): Promise<string> {
    const bucket = process.env.MINIO_ACCESS_KEY === 'minioadmin' 
      ? 'fiscus-dev' 
      : process.env.AWS_S3_BUCKET || 'fiscus-documents-dev';

    try {
      if (this.useLocal) {
        return await this.minioClient.presignedGetObject(bucket, key, expirySeconds);
      } else {
        return this.s3Client.getSignedUrl('getObject', {
          Bucket: bucket,
          Key: key,
          Expires: expirySeconds,
        });
      }
    } catch (error: any) {
      throw new BadRequestException(`Failed to get file URL: ${error?.message || 'Unknown error'}`);
    }
  }
}
