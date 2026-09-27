import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '../../common/base/crud/base.controller';
import { AutoCrudPermissions } from '../../common/decorators/crud-permissions.decorator';
import { ContractStatus } from '../../common/enums/contract.enum';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../rbac/decorators/roles.decorator';
import { ContractService } from './contract.service';
import { ContractChangeStatusDto } from './dto/contract-dto/contract.change.status.dto';
import { ContractCreateDto } from './dto/contract-dto/contract.create.dto';
import { ContractDetailDto } from './dto/contract-dto/contract.detail.dto';
import { ContractListDto } from './dto/contract-dto/contract.list.dto';
import { ContractUpdateDto } from './dto/contract-dto/contract.update.dto';
import { Contracts } from './entities/contracts.entity';

@ApiTags('Contract')
@ApiBearerAuth()
@Controller('api/contract')
@Roles(
  Role.ADMIN,
  Role.OWNER,
  Role.PROPERTY_MANAGER,
  Role.ACCOUNTANT,
  Role.TENANT,
)
@AutoCrudPermissions('CONTRACT')
export class ContractController extends BaseController<
  ContractService,
  Contracts,
  ContractDetailDto,
  ContractListDto,
  ContractCreateDto,
  ContractUpdateDto
> {
  constructor(private readonly contractService: ContractService) {
    super(
      contractService,
      ContractDetailDto,
      ContractListDto,
      ContractCreateDto,
      ContractUpdateDto,
    );
  }

  // @Get('room/:roomId')
  // @ApiOperation({ summary: 'Get contracts by room ID' })
  // @ApiResponse({ status: 200, description: 'List of contracts for the room.' })
  // async getContractsByRoomId(@Param('roomId') roomId: string) {
  //   return await this.contractService.findByRoomId(roomId);
  // }

  // @Get('room/:roomId/active')
  // @ApiOperation({ summary: 'Get active contract by room ID' })
  // @ApiResponse({ status: 200, description: 'Active contract for the room.' })
  // @ApiResponse({ status: 404, description: 'No active contract found.' })
  // async getActiveContractByRoomId(@Param('roomId') roomId: string) {
  //   return await this.contractService.findActiveContractByRoomId(roomId);
  // }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contract status' })
  @ApiResponse({
    status: 200,
    description: 'Contract status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  async updateContractStatus(
    @Param('id') id: string,
    @Body() body: { status: ContractStatus },
  ) {
    const updateDto = new ContractUpdateDto();
    updateDto.id = id;
    updateDto.status = body.status;
    return await this.contractService.update(updateDto);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate contract early' })
  @ApiResponse({
    status: 200,
    description: 'Contract terminated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Contract not found.' })
  async terminateContract(
    @Param('id') id: string,
    @Body() body: { terminationDate?: string; notes?: string },
  ) {
    const updateDto = new ContractUpdateDto();
    updateDto.id = id;
    updateDto.status = ContractStatus.TERMINATED_EARLY;
    if (body.terminationDate) {
      updateDto.endDate = body.terminationDate;
    }
    if (body.notes) {
      updateDto.notes = body.notes;
    }
    return await this.contractService.update(updateDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate contract' })
  @ApiResponse({ status: 200, description: 'Hợp đồng đã có hiệu lực.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hợp đồng.' })
  async activateContract(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const updateDto = new ContractChangeStatusDto();
    updateDto.id = id;
    updateDto.status = ContractStatus.ACTIVE;
    if (body.reason) {
      updateDto.reason = body.reason;
    }
    return await this.contractService.active(updateDto);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Terminate contract' })
  @ApiResponse({
    status: 200,
    description: 'Hợp đồng đã bị hủy hiệu lực.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hợp đồng.' })
  async deactivateContract(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const updateDto = new ContractChangeStatusDto();
    updateDto.id = id;
    updateDto.status = ContractStatus.TERMINATED_EARLY;
    updateDto.reason = body.reason;
    return await this.contractService.deActive(true, updateDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get contracts by status' })
  @ApiResponse({
    status: 200,
    description: 'List of contracts with specified status.',
  })
  async getContractsByStatus(
    @Param('status') status: ContractStatus,
    @Query() query: any,
  ) {
    // Thêm filter status vào query
    query.status = status;
    return await this.getAll(query);
  }
}
