import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BalanceTransfer } from '../entities/balance-transfer.entity';
import { Wallet } from '../entities/wallet.entity';
import { SalePoint } from '../entities/sale-point.entity';

const r2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const norm = (s: string) => String(s ?? '').trim().toLowerCase();

type Party = { kind: 'wallet' | 'point'; id: string; name: string };

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(BalanceTransfer)
    private readonly transferRepo: Repository<BalanceTransfer>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return this.transferRepo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  /**
   * Transferência real: tira da origem e põe no destino na mesma transacção
   * (antes só ficava um registo e os saldos não mexiam).
   * Origem/destino podem ser uma carteira ou um ponto de venda, indicados pelo nome.
   */
  async create(data: {
    originName: string;
    destinationName: string;
    amount: number;
    transferredBy: string;
    reason?: string;
  }) {
    const amount = r2(Number(data.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('O valor da transferência tem de ser positivo.');
    }
    if (norm(data.originName) === norm(data.destinationName)) {
      throw new BadRequestException('A origem e o destino não podem ser iguais.');
    }

    return this.dataSource.transaction(async (m) => {
      const origin = await this.resolve(m, data.originName, 'Origem');
      const dest = await this.resolve(m, data.destinationName, 'Destino');

      await this.move(m, origin, -amount);
      await this.move(m, dest, +amount);

      const transfer = m.create(BalanceTransfer, {
        originName: origin.name,
        destinationName: dest.name,
        amount,
        transferredBy: data.transferredBy?.trim() || 'Operador',
        reason: data.reason?.trim() || null,
      } as Partial<BalanceTransfer>);
      return m.save(BalanceTransfer, transfer);
    });
  }

  private async resolve(m: EntityManager, name: string, label: string): Promise<Party> {
    const wallets = await m.find(Wallet);
    const w = wallets.find((x) => norm(x.name) === norm(name));
    if (w) return { kind: 'wallet', id: w.id, name: w.name };
    const points = await m.find(SalePoint);
    const p = points.find((x) => norm(x.name) === norm(name));
    if (p) return { kind: 'point', id: p.id, name: p.name };
    throw new BadRequestException(`${label} "${name}" não encontrada (carteira ou ponto de venda).`);
  }

  /** Soma ou subtrai numa só instrução SQL. Ao subtrair, só actualiza se o saldo chegar. */
  private async move(m: EntityManager, party: Party, delta: number) {
    const table = party.kind === 'wallet' ? 'wallets' : 'sale_points';
    const col = party.kind === 'wallet' ? 'balance' : 'currentCashBalance';
    const sql =
      delta < 0
        ? `UPDATE "${table}" SET "${col}" = "${col}" + $1, "updatedAt" = now() WHERE "id" = $2 AND "${col}" + $1 >= 0`
        : `UPDATE "${table}" SET "${col}" = "${col}" + $1, "updatedAt" = now() WHERE "id" = $2`;
    const res = await m.query(sql, [delta, party.id]);
    const affected = Array.isArray(res) ? res[1] : res?.rowCount;
    if (!affected) {
      throw new BadRequestException(`Saldo insuficiente em "${party.name}" para esta transferência.`);
    }
  }
}
