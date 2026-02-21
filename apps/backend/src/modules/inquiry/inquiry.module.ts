import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { InquiryComment } from './entities/inquiry-comment.entity';
import { InquiryService } from './services/inquiry.service';
import { InquiryController } from './controllers/inquiry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, InquiryComment])],
  providers: [InquiryService],
  controllers: [InquiryController],
  exports: [InquiryService],
})
export class InquiryModule {}
