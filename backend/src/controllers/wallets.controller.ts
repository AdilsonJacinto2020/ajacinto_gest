import { Controller, Get } from '@nestjs/common';
import { WalletsService } from '../services/wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  async getWallets() {
    return this.walletsService.findAll();
  }
}
