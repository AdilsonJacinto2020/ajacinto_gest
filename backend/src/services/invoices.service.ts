import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, PaymentMethod } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { SalePoint } from '../entities/sale-point.entity';
import { WalletsService } from './wallets.service';
import { WalletType } from '../entities/wallet.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(SalePoint)
    private readonly salePointRepo: Repository<SalePoint>,
    private readonly walletsService: WalletsService,
  ) {}

  async findAll() {
    return this.invoiceRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
      relations: ['items', 'salePoint'],
    });
  }

  async create(data: {
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
  }) {
    const salePoint = await this.salePointRepo.findOneBy({
      id: data.salePointId,
    });

    const currentYear = new Date().getFullYear();
    const count = await this.invoiceRepo.count();
    const invoiceNumber = `FR ${currentYear}/${String(count + 1).padStart(4, '0')}`;

    let subtotal = 0;
    const invoiceItems: InvoiceItem[] = [];

    for (const it of data.items) {
      const itemTotal = Number(it.price) * Number(it.quantity);
      subtotal += itemTotal;

      const itemEntity = new InvoiceItem();
      itemEntity.operator = it.operator;
      itemEntity.productName = it.name;
      itemEntity.recipient = it.recipient;
      itemEntity.quantity = Number(it.quantity);
      itemEntity.unitPrice = Number(it.price);
      itemEntity.totalPrice = itemTotal;
      invoiceItems.push(itemEntity);

      // Abate saldo da carteira da operadora correspondente
      if (it.operator === 'UNITEL') {
        await this.walletsService.deduct(WalletType.MSELLER, itemTotal);
      } else if (it.operator === 'AFRICELL') {
        await this.walletsService.deduct(WalletType.AFRIMONEY, itemTotal);
      } else if (it.operator === 'ZAP' || it.operator === 'DSTV') {
        await this.walletsService.deduct(WalletType.TELPLAY_ZAP, itemTotal);
      }
    }

    const invoice = this.invoiceRepo.create({
      invoiceNumber,
      clientName: data.clientName || 'Consumidor Final',
      clientNif: data.clientNif || null,
      clientPhone: data.clientPhone || null,
      paymentMethod: data.paymentMethod || PaymentMethod.CASH,
      subtotal,
      taxRate: 0, // Sem IVA
      taxAmount: 0,
      total: subtotal,
      operatorName: data.operatorName || 'Operador',
      salePoint,
      items: invoiceItems,
    });

    const saved = await this.invoiceRepo.save(invoice);

    // Se pago em dinheiro físico, soma no caixa do ponto de venda
    if (data.paymentMethod === PaymentMethod.CASH && salePoint) {
      salePoint.currentCashBalance =
        Number(salePoint.currentCashBalance) + subtotal;
      await this.salePointRepo.save(salePoint);
    }

    return saved;
  }
}
