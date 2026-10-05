import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractClient } from '../contract/entities/contract-client.entity';
import { Contracts } from '../contract/entities/contracts.entity';
import { CurrentUserModule } from '../current.user';
import { Invoice } from '../invoice/entities/invoice.entity';
import { Properties } from '../property/entities/properties.entity';
import { RoomActionSignal } from '../property/entities/room-action-signal.view';
import { Rooms } from '../property/entities/rooms.entity';
import { PropertyModule } from '../property/property.module';
import { UserRole } from '../rbac/entities/user-role.entity';
import { HomepageScopeService } from './homepage-scope.service';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Properties,
      Rooms,
      RoomActionSignal,
      Contracts,
      ContractClient,
      Invoice,
      UserRole,
    ]),
    CurrentUserModule,
    PropertyModule,
  ],
  controllers: [HomepageController],
  providers: [HomepageService, HomepageScopeService],
})
export class HomepageModule {}
