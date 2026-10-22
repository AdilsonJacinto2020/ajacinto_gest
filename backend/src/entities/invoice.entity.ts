import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SalePoint } from './sale-point.entity';
import { Shift } from './shift.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  TPA = 'TPA',
  TRANSFER = 'TRANSFER',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string; // Ex: "FR 2026/0001"

  @Column({ default: 'Consumidor Final' })
  clientName: string;

  @Column({ nullable: true })
  clientNif: string;

  @Column({ nullable: true })
  clientPhone: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number; // 0% sem IVA

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number; // 0 Kz

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'EMITIDA' })
  status: string;

  @ManyToOne(() => SalePoint, { eager: true })
  salePoint: SalePoint;

  @ManyToOne(() => Shift, (shift) => shift.invoices, { nullable: true })
  shift: Shift;

  @Column()
  operatorName: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items: InvoiceItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
