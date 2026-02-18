import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeatureFlagsService } from '../services/feature-flags.service';

@ApiTags('Feature Flags')
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all feature flags' })
  getAll() {
    return this.featureFlagsService.getAll();
  }

  @Get(':flag')
  @ApiOperation({ summary: 'Check if feature is enabled' })
  isEnabled(flag: string) {
    return {
      flag,
      enabled: this.featureFlagsService.isEnabled(flag as any),
    };
  }
}
