import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../invoice/entities/invoice.entity';
import { CurrentUserModule } from '../current.user';
import { Properties } from '../property/entities/properties.entity';
import { RbacModule } from '../rbac/rbac.module';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Properties]),
    CurrentUserModule,
    RbacModule,
  ],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService, PaymentRepository],
  controllers: [PaymentController],
})
export class PaymentModule {}

