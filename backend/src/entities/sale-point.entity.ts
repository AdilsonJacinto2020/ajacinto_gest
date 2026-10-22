import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Shift } from './shift.entity';

@Entity('sale_points')
export class SalePoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Ex: "Ponto Morro Bento (Sede)"

  @Column({ default: 'Luanda' })
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentCashBalance: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOpen: boolean;

  @Column({ nullable: true })
  assignedOperatorName: string; // Operador fixo/alocado ao ponto

  @Column({ nullable: true })
  currentOperatorName: string; // Operador no turno ativo

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Shift, (shift) => shift.salePoint)
  shifts: Shift[];
}
