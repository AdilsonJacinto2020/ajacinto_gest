import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WalletsService } from '../services/wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  async getWallets() {
    return this.walletsService.findAll();
  }

  @Post(':id/adjust-balance')
  async adjustBalance(
    @Param('id') id: string,
    @Body() body: { newBalance: number; reason: string; operatorName: string },
  ) {
    return this.walletsService.adjustBalance(
      id,
      Number(body.newBalance),
      body.reason,
      body.operatorName,
    );
  }
}
