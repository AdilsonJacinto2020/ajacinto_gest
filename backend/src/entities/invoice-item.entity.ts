import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  operator: string; // "UNITEL", "AFRICELL", "ZAP", "DSTV"

  @Column()
  productName: string;

  @Column()
  recipient: string; // Telemóvel ou Nº de Cartão ZAP/DStv

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;
}
