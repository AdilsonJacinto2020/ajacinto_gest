import { Controller, Get, Post, Body } from '@nestjs/common';
import { TransfersService } from '../services/transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  async getTransfers() {
    return this.transfersService.findAll();
  }

  @Post()
  async createTransfer(
    @Body()
    body: {
      originName: string;
      destinationName: string;
      amount: number;
      transferredBy: string;
      reason?: string;
    },
  ) {
    return this.transfersService.create({
      ...body,
      amount: Number(body.amount),
    });
  }
}
