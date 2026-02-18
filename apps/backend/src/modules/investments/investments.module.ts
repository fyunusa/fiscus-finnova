import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './entities/investment.entity';
import { UserInvestment } from './entities/user-investment.entity';
import { UserFavoriteInvestment } from './entities/user-favorite-investment.entity';
import { InvestmentsService } from './services/investments.service';
import { DashboardService } from './services/dashboard.service';
import { InvestmentsController } from './controllers/investments.controller';
import { DashboardController } from './controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Investment, UserInvestment, UserFavoriteInvestment])],
  providers: [InvestmentsService, DashboardService],
  controllers: [InvestmentsController, DashboardController],
  exports: [InvestmentsService, DashboardService],
})
export class InvestmentsModule {}
