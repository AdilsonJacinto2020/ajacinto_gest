import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletType } from '../entities/wallet.entity';
import { BalanceAdjustment, TargetType } from '../entities/balance-adjustment.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(BalanceAdjustment)
    private readonly adjustmentRepo: Repository<BalanceAdjustment>,
  ) {}

  async findAll() {
    return this.walletRepo.find();
  }

  async adjustBalance(
    walletId: string,
    newBalance: number,
    reason: string,
    operatorName: string,
  ) {
    const wallet = await this.walletRepo.findOneBy({ id: walletId });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');

    const previousBalance = Number(wallet.balance);
    const targetBalance = Number(newBalance);
    const diff = targetBalance - previousBalance;

    wallet.balance = targetBalance;
    const saved = await this.walletRepo.save(wallet);

    const adjustment = this.adjustmentRepo.create({
      targetType: TargetType.WALLET,
      targetId: wallet.id,
      targetName: wallet.name,
      previousBalance,
      newBalance: targetBalance,
      difference: diff,
      reason: reason || 'Retificação de saldo em carteira',
      adjustedBy: operatorName || 'Operador',
    });
    await this.adjustmentRepo.save(adjustment);

    return { wallet: saved, adjustment };
  }

  async deduct(type: WalletType, amount: number) {
    const wallet = await this.walletRepo.findOneBy({ type });
    if (wallet) {
      wallet.balance = Math.max(0, Number(wallet.balance) - Number(amount));
      await this.walletRepo.save(wallet);
    }
  }

  /** Cria as 4 carteiras só na primeira vez, todas a 0 Kz. Os saldos reais entram por "Ajustar saldo". */
  async seedDefaultWallets() {
    const count = await this.walletRepo.count();
    if (count === 0) {
      await this.walletRepo.save([
        { type: WalletType.CAIXA_GERAL, name: 'Caixa Geral (Empresa)', balance: 0 },
        { type: WalletType.MSELLER, name: 'mSeller (Unitel)', balance: 0 },
        { type: WalletType.AFRIMONEY, name: 'Afrimoney (Africell)', balance: 0 },
        { type: WalletType.TELPLAY_ZAP, name: 'Telplay / ZAP / DStv', balance: 0 },
      ]);
    }
  }
}
