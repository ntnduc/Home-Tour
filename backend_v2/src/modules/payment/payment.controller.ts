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
import { BaseFilterDto } from 'src/common/base/dto/filter.dto';
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
    @Query() query: BaseFilterDto<Payment>,
  ) {
    return await this.getAll(this.withFilter(query, { invoiceId }));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get payments by status' })
  @ApiResponse({
    status: 200,
    description: 'List of payments with specified status.',
  })
  async getPaymentsByStatus(
    @Param('status') status: PaymentStatus,
    @Query() query: BaseFilterDto<Payment>,
  ) {
    return await this.getAll(this.withFilter(query, { status }));
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get payments by type' })
  @ApiResponse({
    status: 200,
    description: 'List of payments with specified type.',
  })
  async getPaymentsByType(
    @Param('type') type: PaymentType,
    @Query() query: BaseFilterDto<Payment>,
  ) {
    return await this.getAll(this.withFilter(query, { type }));
  }

  // Merge a fixed filter into the paging query, keeping limit/offset/sort from the request
  private withFilter(
    query: BaseFilterDto<Payment>,
    fixed: Partial<Payment>,
  ): BaseFilterDto<Payment> {
    return {
      ...query,
      filters: { ...query?.filters, ...fixed } as Payment,
    };
  }
}
