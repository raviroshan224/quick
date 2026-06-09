import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { CustomersModule } from './customers/customers.module';
import { ServicesModule } from './services/services.module';
import { ProductsModule } from './products/products.module';
import { DiscountsModule } from './discounts/discounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CashDrawerModule } from './cash-drawer/cash-drawer.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { InventoryModule } from './inventory/inventory.module';
import { RefundsModule } from './refunds/refunds.module';
import { ImageLibraryModule } from './image-library/image-library.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StaffModule,
    CustomersModule,
    ServicesModule,
    ProductsModule,
    DiscountsModule,
    TransactionsModule,
    CashDrawerModule,
    ReportsModule,
    SettingsModule,
    // Phase 1 additions
    InventoryModule,
    RefundsModule,
    ImageLibraryModule,
    DashboardModule,
  ],
})
export class AppModule {}
