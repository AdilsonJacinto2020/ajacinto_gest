import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { PaymentMethod } from '../entities/invoice.entity';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@Query('salePointId') salePointId?: string) {
    return this.invoicesService.findAll(salePointId);
  }

  @Post()
  async createInvoice(
    @Body()
    body: {
      clientName?: string;
      clientNif?: string;
      clientPhone?: string;
      paymentMethod: PaymentMethod;
      salePointId: string;
      operatorName: string;
      items: Array<{
        operator: string;
        name: string;
        recipient: string;
        quantity: number;
        price: number;
      }>;
    },
  ) {
    return this.invoicesService.create(body);
  }
}
