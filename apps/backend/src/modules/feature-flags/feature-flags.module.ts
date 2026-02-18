import { Module } from '@nestjs/common';
import { FeatureFlagsService } from './services/feature-flags.service';
import { FeatureFlagsController } from './controllers/feature-flags.controller';

@Module({
  providers: [FeatureFlagsService],
  controllers: [FeatureFlagsController],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
