import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ServiceCalculationMethod } from 'src/common/enums/service.enum';
import { BaseCreateDto } from '../../../../common/base/dto/create.dto';
import { ContractServices } from '../../entities/contract-services.entity';

export class ContractServiceCreateDto extends BaseCreateDto<ContractServices> {
  @IsUUID()
  @IsOptional()
  contractId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @IsEnum(ServiceCalculationMethod)
  calculationMethod: ServiceCalculationMethod;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isSelectedFromService?: boolean;

  @IsNumber()
  @IsOptional()
  helperValue?: number;

  getEntity(): ContractServices {
    const entity = new ContractServices();
    if (this.contractId) entity.contractId = this.contractId;
    entity.price = this.price ?? 0;
    entity.isEnabled = true;
    entity.name = this.name ?? '';
    entity.notes = this.notes;
    entity.calculationMethod = this.calculationMethod;
    entity.helperValue = this.helperValue ?? 0;
    return entity;
  }
}
