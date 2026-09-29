import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '../../common/base/crud/base.controller';
import { AutoCrudPermissions } from '../../common/decorators/crud-permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../rbac/decorators/roles.decorator';
import { InvoiceCreateDto } from './dto/invoice-dto/invoice.create.dto';
import { InvoiceDetailDto } from './dto/invoice-dto/invoice.detail.dto';
import { InvoiceListDto } from './dto/invoice-dto/invoice.list.dto';
import { InvoicePaymentDto } from './dto/invoice-dto/invoice.payment.dto';
import { InvoiceUpdateDto } from './dto/invoice-dto/invoice.update.dto';
import { InvoiceUpdateItemsDto } from './dto/invoice-dto/invoice.update-items.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';

@ApiTags('Invoice')
@ApiBearerAuth()
@Controller('api/invoice')
@Roles(
  Role.ADMIN,
  Role.OWNER,
  Role.PROPERTY_MANAGER,
  Role.ACCOUNTANT,
  Role.TENANT,
)
@AutoCrudPermissions('INVOICE')
export class InvoiceController extends BaseController<
  InvoiceService,
  Invoice,
  InvoiceDetailDto,
  InvoiceListDto,
  InvoiceCreateDto,
  InvoiceUpdateDto
> {
  constructor(private readonly invoiceService: InvoiceService) {
    super(
      invoiceService,
      InvoiceDetailDto,
      InvoiceListDto,
      InvoiceCreateDto,
      InvoiceUpdateDto,
    );
  }

  // @Get('status/:status')
  // @ApiOperation({ summary: 'Get invoices by status' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of invoices with specified status.',
  // })
  // async getInvoicesByStatus(
  //   @Param('status') status: InvoiceStatus,
  //   @Query() query: any,
  // ) {
  //   return new NotFoundException('Method not implemented yet');
  // }

  // @Patch(':id/status')
  // @ApiOperation({ summary: 'Update invoice status' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Invoice status updated successfully.',
  // })
  // @ApiResponse({ status: 404, description: 'Invoice not found.' })
  // async updateInvoiceStatus(
  //   @Param('id') id: string,
  //   @Body() body: { status: InvoiceStatus },
  // ) {
  //   const updateDto = new InvoiceUpdateDto();
  //   updateDto.id = id;
  //   updateDto.status = body.status;
  //   return new NotFoundException('Method not implemented yet');
  // }

  @Patch('payment')
  @ApiOperation({ summary: 'Update invoice payment' })
  @ApiResponse({
    status: 200,
    description: 'Invoice payment updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async updateInvoicePayment(@Body() data: InvoicePaymentDto) {
    return await this.invoiceService.paymentInvoice(data);
  }

  @Patch('confirm/:id')
  @ApiOperation({ summary: 'Confirm invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice confirmed successfully.',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async confirmInvoice(@Param('id') id: string): Promise<InvoiceDetailDto> {
    return await this.invoiceService.confirmInvoice(id);
  }

  @Patch('items')
  @ApiOperation({ summary: 'Update invoice items price' })
  @ApiResponse({
    status: 200,
    description: 'Invoice items updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found.' })
  async updateInvoiceItems(
    @Body() data: InvoiceUpdateItemsDto,
  ): Promise<InvoiceDetailDto> {
    return await this.invoiceService.updateInvoiceItems(data);
  }

  async update(@Body() dto: InvoiceUpdateDto): Promise<InvoiceDetailDto> {
    throw new NotFoundException('Method not implemented yet');
  }
}
