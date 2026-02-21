import { Module } from '@nestjs/common';
import { DepositsController } from './controllers/deposits.controller';
import { DepositsService } from './services/deposits.service';
import { ExternalApiModule } from '@modules/external-api/external-api.module';

@Module({
  imports: [ExternalApiModule],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
