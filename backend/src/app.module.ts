import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SalePoint } from './entities/sale-point.entity';
import { Shift } from './entities/shift.entity';
import { Wallet, WalletType } from './entities/wallet.entity';
import { BalanceTransfer } from './entities/balance-transfer.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { User, UserRole } from './entities/user.entity';
import { CashExpense } from './entities/cash-expense.entity';
import { BalanceAdjustment } from './entities/balance-adjustment.entity';

import { PointsController } from './controllers/points.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { TransfersController } from './controllers/transfers.controller';
import { WalletsController } from './controllers/wallets.controller';
import { AdminController } from './controllers/admin.controller';

import { PointsService } from './services/points.service';
import { InvoicesService } from './services/invoices.service';
import { TransfersService } from './services/transfers.service';
import { WalletsService } from './services/wallets.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/adijacinto_db',
      autoLoadEntities: true,
      synchronize: true, // Automático para ambiente de desenvolvimento
      ssl:
        process.env.DATABASE_URL?.includes('neon.tech') ||
        process.env.DATABASE_URL?.includes('supabase')
          ? { rejectUnauthorized: false }
          : false,
    }),
    TypeOrmModule.forFeature([
      SalePoint,
      Shift,
      Wallet,
      BalanceTransfer,
      Invoice,
      InvoiceItem,
      User,
      CashExpense,
      BalanceAdjustment,
    ]),
  ],
  controllers: [
    PointsController,
    InvoicesController,
    TransfersController,
    WalletsController,
    AdminController,
  ],
  providers: [PointsService, InvoicesService, TransfersService, WalletsService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly pointsService: PointsService,
    private readonly walletsService: WalletsService,
  ) {}

  async onModuleInit() {
    // Seed automático inicial para Pontos e Carteiras
    await this.pointsService.seedDefaultPoints();
    await this.walletsService.seedDefaultWallets();
  }
}
