import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from 'src/common/base/crud/base.controller';
import { AllowAuthenticated } from 'src/common/decorators/allow-anonymous.decorator';
import { AutoCrudPermissions } from 'src/common/decorators/crud-permissions.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from '../rbac/decorators/roles.decorator';
import { PropertyCreateDto } from './dto/properties-dto/property.create.dto';
import { PropertyDetailDto } from './dto/properties-dto/property.detail.dto';
import { PropertyListDto } from './dto/properties-dto/property.list.dto';
import { PropertyUpdateDto } from './dto/properties-dto/property.update.dto';
import { Properties } from './entities/properties.entity';
import { PropertyService } from './property.service';

@ApiTags('property')
@ApiBearerAuth()
@Controller('api/property')
@Roles(
  Role.ADMIN,
  Role.OWNER,
  Role.PROPERTY_MANAGER,
  Role.ACCOUNTANT,
  Role.TENANT,
)
@AutoCrudPermissions('PROPERTY')
export class PropertyController extends BaseController<
  PropertyService,
  Properties,
  PropertyDetailDto,
  PropertyListDto,
  PropertyCreateDto,
  PropertyUpdateDto
> {
  constructor(private readonly propertyService: PropertyService) {
    super(
      propertyService,
      PropertyDetailDto,
      PropertyListDto,
      PropertyCreateDto,
      PropertyUpdateDto,
    );
  }

  // Any authenticated user may create a property; the creator becomes its OWNER
  @Post()
  @AllowAuthenticated()
  @ApiOperation({ summary: 'Create a new property (creator becomes OWNER)' })
  override async create(
    @Request() req: Request,
    @Body() dto: PropertyCreateDto,
  ) {
    return await super.create(req, dto);
  }

  @Get('combo')
  @ApiOperation({ summary: 'Get combo property' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Entity already exists.' })
  async getComboProperty() {
    return await this.propertyService.getComboProperty();
  }
}
