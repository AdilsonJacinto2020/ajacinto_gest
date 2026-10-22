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
import { Invoice } from './invoice.entity';

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalePoint, (point) => point.shifts, { eager: true })
  salePoint: SalePoint;

  @Column()
  operatorName: string;

  @Column({ type: 'timestamp' })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  openingCash: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  closingCashCalculated: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  closingCashDeclared: number;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.OPEN,
  })
  status: ShiftStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.shift)
  invoices: Invoice[];
}
