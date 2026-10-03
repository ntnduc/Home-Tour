import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRepository } from '../client/repositories/client.repository';
import { CurrentUserModule } from '../current.user';
import { InvoiceModule } from '../invoice/invoice.module';
import { PropertiesService } from '../property/entities/properties-service.entity';
import { Properties } from '../property/entities/properties.entity';
import { Rooms } from '../property/entities/rooms.entity';
import { PropertiesServiceRepository } from '../property/repositories/properties-service.repository';
import { PropertiesRepository } from '../property/repositories/properties.repository';
import { RoomsRepository } from '../property/repositories/rooms.repository';
import { RbacModule } from '../rbac/rbac.module';
import { Services } from '../services/entities/services.entity';
import { ServicesRepository } from '../services/repositories/services.repository';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { ContractClientController } from './contract-client.controller';
import { ContractClientService } from './contract-client.service';
import { ContractServicesController } from './contract-services.controller';
import { ContractServicesService } from './contract-services.service';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { ContractClient } from './entities/contract-client.entity';
import { ContractServices } from './entities/contract-services.entity';
import { Contracts } from './entities/contracts.entity';
import { ContractClientRepository } from './repositories/contract-client.repository';
import { ContractServicesRepository } from './repositories/contract-services.repository';
import { ContractsRepository } from './repositories/contracts.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contracts,
      Rooms,
      Properties,
      PropertiesService,
      Services,
      User,
      ContractClient,
      ContractServices,
    ]),
    CurrentUserModule,
    RbacModule,
    InvoiceModule,
  ],
  providers: [
    ContractService,
    ContractClientService,
    ContractServicesService,
    RoomsRepository,
    PropertiesRepository,
    PropertiesServiceRepository,
    ServicesRepository,
    ContractClientRepository,
    ContractServicesRepository,
    ContractsRepository,
    ContractClientRepository,
    ContractServicesRepository,
    ContractsRepository,
    UserRepository,
    ClientRepository,
  ],
  exports: [ContractService, ContractClientService, ContractServicesService],
  controllers: [
    ContractController,
    ContractClientController,
    ContractServicesController,
  ],
})
export class ContractModule {}
