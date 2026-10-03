import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '../../common/base/crud/base.controller';
import { AutoCrudPermissions } from '../../common/decorators/crud-permissions.decorator';
import { PaymentStatus, PaymentType } from '../../common/enums/payment.enum';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../rbac/decorators/roles.decorator';
import { PaymentCreateDto } from './dto/payment-dto/payment.create.dto';
import { PaymentDetailDto } from './dto/payment-dto/payment.detail.dto';
import { PaymentListDto } from './dto/payment-dto/payment.list.dto';
import { PaymentUpdateDto } from './dto/payment-dto/payment.update.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('api/payment')
@Roles(
  Role.ADMIN,
  Role.OWNER,
  Role.PROPERTY_MANAGER,
  Role.ACCOUNTANT,
  Role.TENANT,
)
@AutoCrudPermissions('PAYMENT')
export class PaymentController extends BaseController<
  PaymentService,
  Payment,
  PaymentDetailDto,
  PaymentListDto,
  PaymentCreateDto,
  PaymentUpdateDto
> {
  constructor(private readonly paymentService: PaymentService) {
    super(
      paymentService,
      PaymentDetailDto,
      PaymentListDto,
      PaymentCreateDto,
      PaymentUpdateDto,
    );
  }

  @Post()
  @ApiResponse({ status: 404, description: 'Hóa đơn không tồn tại.' })
  async create(@Request() req: Request, @Body() dto: PaymentCreateDto) {
    throw new BadRequestException('Method not implemented yet');
    return new PaymentDetailDto();
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Get payments by invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'List of payments for the invoice.',
  })
  async getPaymentsByInvoiceId(
    @Param('invoiceId') invoiceId: string,
    @Query() query: any,
  ) {
    query.invoiceId = invoiceId;
    return await this.getAll(query);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get payments by status' })
  @ApiResponse({
    status: 200,
    description: 'List of payments with specified status.',
  })
  async getPaymentsByStatus(
    @Param('status') status: PaymentStatus,
    @Query() query: any,
  ) {
    query.status = status;
    return await this.getAll(query);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get payments by type' })
  @ApiResponse({
    status: 200,
    description: 'List of payments with specified type.',
  })
  async getPaymentsByType(
    @Param('type') type: PaymentType,
    @Query() query: any,
  ) {
    query.type = type;
    return await this.getAll(query);
  }
}
