import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { SalePoint } from './sale-point.entity';

@Entity('cash_expenses')
export class CashExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalePoint, { eager: true })
  salePoint: SalePoint;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  reason: string; // Motivo da saída: ex: "Água / Lanche", "Transporte", "Material de limpeza", etc.

  @Column()
  operatorName: string; // Quem registou ou autorizou a saída

  @CreateDateColumn()
  createdAt: Date;
}
