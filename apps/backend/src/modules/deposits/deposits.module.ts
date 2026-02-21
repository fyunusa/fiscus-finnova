import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsController } from './controllers/deposits.controller';
import { DepositsPublicController } from './controllers/deposits-public.controller';
import { DepositsService } from './services/deposits.service';
import { ExternalApiModule } from '@modules/external-api/external-api.module';
import { VirtualAccount } from '@modules/users/entities/virtual-account.entity';
import { VirtualAccountTransaction } from '@modules/users/entities/virtual-account-transaction.entity';

@Module({
  imports: [
    ExternalApiModule,
    TypeOrmModule.forFeature([VirtualAccount, VirtualAccountTransaction]),
  ],
  controllers: [DepositsController, DepositsPublicController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
