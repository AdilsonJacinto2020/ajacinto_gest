import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice, PaymentMethod } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { SalePoint } from '../entities/sale-point.entity';
import { Shift, ShiftStatus } from '../entities/shift.entity';
import { WalletType } from '../entities/wallet.entity';

const OPERATOR_WALLET: Record<string, WalletType> = {
  UNITEL: WalletType.MSELLER,
  AFRICELL: WalletType.AFRIMONEY,
  ZAP: WalletType.TELPLAY_ZAP,
  DSTV: WalletType.TELPLAY_ZAP,
};

const r2 = (n: number) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Ano em hora de Luanda (UTC+1, sem hora de verão). */
const anoEmLuanda = (d = new Date()) => new Date(d.getTime() + 60 * 60 * 1000).getUTCFullYear();

export interface CreateInvoiceInput {
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
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(salePointId?: string) {
    return this.invoiceRepo.find({
      where: salePointId ? { salePoint: { id: salePointId } } : {},
      order: { createdAt: 'DESC' },
      take: 500,
      relations: ['items', 'salePoint'],
    });
  }

  /**
   * Emite uma fatura. Tudo acontece numa única transacção: ou grava tudo
   * (fatura, itens, número, saldo das carteiras, dinheiro do ponto) ou não grava nada.
   */
  async create(data: CreateInvoiceInput) {
    // ---------- 1) Validar antes de tocar na base de dados ----------
    if (!data?.salePointId) throw new BadRequestException('Escolha o ponto de venda.');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(data.salePointId))) {
      throw new NotFoundException('Ponto de venda não encontrado.');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException('A fatura precisa de pelo menos um item.');
    }
    const paymentMethod = data.paymentMethod || PaymentMethod.CASH;
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      throw new BadRequestException('Forma de pagamento inválida.');
    }

    const lines = data.items.map((it) => {
      const operator = String(it.operator || '').toUpperCase();
      const quantity = Number(it.quantity);
      const price = r2(Number(it.price));
      if (!OPERATOR_WALLET[operator]) throw new BadRequestException(`Operadora inválida: "${it.operator}".`);
      if (!String(it.name || '').trim()) throw new BadRequestException('Cada item precisa de uma descrição.');
      if (!String(it.recipient || '').trim()) {
        throw new BadRequestException(`Falta o número do telemóvel/cartão em "${it.name}".`);
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new BadRequestException(`Quantidade inválida em "${it.name}" (1 a 100).`);
      }
      if (!Number.isFinite(price) || price <= 0) {
        throw new BadRequestException(`Preço inválido em "${it.name}".`);
      }
      return { operator, name: String(it.name).trim(), recipient: String(it.recipient).trim(), quantity, price, total: r2(price * quantity) };
    });
    const subtotal = r2(lines.reduce((s, l) => s + l.total, 0));

    // ---------- 2) Gravar tudo de uma vez ----------
    return this.dataSource.transaction(async (m) => {
      const salePoint = await m.findOne(SalePoint, { where: { id: data.salePointId } });
      if (!salePoint) throw new NotFoundException('Ponto de venda não encontrado.');

      // Abate nas carteiras (uma instrução SQL por carteira). Nunca fica abaixo de zero.
      const porCarteira = new Map<WalletType, number>();
      for (const l of lines) {
        const t = OPERATOR_WALLET[l.operator];
        porCarteira.set(t, r2((porCarteira.get(t) ?? 0) + l.total));
      }
      for (const [type, amount] of porCarteira) {
        const res = await m.query(
          `UPDATE "wallets" SET "balance" = GREATEST("balance" - $1, 0), "updatedAt" = now() WHERE "type" = $2`,
          [amount, type],
        );
        const affected = Array.isArray(res) ? res[1] : res?.rowCount;
        if (!affected) throw new BadRequestException(`Carteira ${type} não encontrada.`);
      }

      // Número sequencial sem buracos e sem repetições
      const year = anoEmLuanda();
      const invoiceNumber = await this.nextInvoiceNumber(m, year);

      // Turno aberto do ponto (para o histórico por turno)
      const shift = await m.findOne(Shift, {
        where: { salePoint: { id: salePoint.id }, status: ShiftStatus.OPEN },
        order: { openedAt: 'DESC' },
      });

      const items = lines.map((l) => {
        const it = new InvoiceItem();
        it.operator = l.operator;
        it.productName = l.name;
        it.recipient = l.recipient;
        it.quantity = l.quantity;
        it.unitPrice = l.price;
        it.totalPrice = l.total;
        return it;
      });

      const invoice = m.create(Invoice, {
        invoiceNumber,
        clientName: data.clientName?.trim() || 'Consumidor Final',
        clientNif: data.clientNif?.trim() || null,
        clientPhone: data.clientPhone?.trim() || null,
        paymentMethod,
        subtotal,
        taxRate: 0, // Sem IVA
        taxAmount: 0,
        total: subtotal,
        operatorName: data.operatorName?.trim() || 'Operador',
        salePoint,
        shift: shift ?? null,
        items,
      } as Partial<Invoice>);
      const saved = await m.save(Invoice, invoice);

      // Dinheiro físico entra no caixa do ponto (soma atómica)
      if (paymentMethod === PaymentMethod.CASH) {
        await m.query(
          `UPDATE "sale_points" SET "currentCashBalance" = "currentCashBalance" + $1, "updatedAt" = now() WHERE "id" = $2`,
          [subtotal, salePoint.id],
        );
      }

      return saved;
    });
  }

  /**
   * Incrementa o contador da série numa só instrução (atómica).
   * Na primeira vez que a série é usada, arranca depois do maior número já existente,
   * para nunca colidir com faturas anteriores.
   */
  private async nextInvoiceNumber(m: DataSource['manager'], year: number): Promise<string> {
    const key = `FR-${year}`;
    const prefix = `FR ${year}/`;
    const [{ max }] = await m.query(
      `SELECT COALESCE(MAX(CAST(SPLIT_PART("invoiceNumber", '/', 2) AS int)), 0) AS max
         FROM "invoices" WHERE "invoiceNumber" LIKE $1`,
      [`${prefix}%`],
    );
    const rows = await m.query(
      `INSERT INTO "document_sequences" ("key", "lastNumber") VALUES ($1, $2)
       ON CONFLICT ("key") DO UPDATE SET "lastNumber" = "document_sequences"."lastNumber" + 1
       RETURNING "lastNumber"`,
      [key, Number(max) + 1],
    );
    const n = Number(rows[0].lastNumber);
    return `${prefix}${String(n).padStart(4, '0')}`;
  }
}
