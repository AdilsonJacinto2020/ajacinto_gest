import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletType } from '../entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  async findAll() {
    return this.walletRepo.find();
  }

  async deduct(type: WalletType, amount: number) {
    const wallet = await this.walletRepo.findOneBy({ type });
    if (wallet) {
      wallet.balance = Math.max(0, Number(wallet.balance) - Number(amount));
      await this.walletRepo.save(wallet);
    }
  }

  async seedDefaultWallets() {
    const count = await this.walletRepo.count();
    if (count === 0) {
      await this.walletRepo.save([
        {
          type: WalletType.CAIXA_GERAL,
          name: 'Caixa Geral (Empresa)',
          balance: 2500000,
        },
        {
          type: WalletType.MSELLER,
          name: 'mSeller (Unitel)',
          balance: 480000,
        },
        {
          type: WalletType.AFRIMONEY,
          name: 'Afrimoney (Africell)',
          balance: 320000,
        },
        {
          type: WalletType.TELPLAY_ZAP,
          name: 'Telplay / ZAP / DStv',
          balance: 650000,
        },
      ]);
    }
  }
}
