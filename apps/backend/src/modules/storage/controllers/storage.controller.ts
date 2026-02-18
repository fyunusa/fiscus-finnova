import { Controller, Post, Delete, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from '../services/storage.service';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  async uploadFile(@UploadedFile() file: any) {
    try {
      return this.storageService.uploadFile(file, 'documents');
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }
}
