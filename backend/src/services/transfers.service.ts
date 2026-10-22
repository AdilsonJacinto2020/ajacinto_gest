import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceTransfer } from '../entities/balance-transfer.entity';
import { WalletsService } from './wallets.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(BalanceTransfer)
    private readonly transferRepo: Repository<BalanceTransfer>,
    private readonly walletsService: WalletsService,
  ) {}

  async findAll() {
    return this.transferRepo.find({ order: { createdAt: 'DESC' }, take: 50 });
  }

  async create(data: {
    originName: string;
    destinationName: string;
    amount: number;
    transferredBy: string;
    reason?: string;
  }) {
    const transfer = this.transferRepo.create(data);
    return this.transferRepo.save(transfer);
  }
}
