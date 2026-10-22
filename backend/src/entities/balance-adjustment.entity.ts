import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TargetType {
  SALE_POINT = 'SALE_POINT',
  WALLET = 'WALLET',
}

@Entity('balance_adjustments')
export class BalanceAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TargetType,
  })
  targetType: TargetType;

  @Column({ nullable: true })
  targetId: string;

  @Column()
  targetName: string; // Ex: "Ponto Morro Bento", "Caixa Geral"

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  previousBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  newBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  difference: number; // newBalance - previousBalance

  @Column()
  reason: string; // Motivo da alteração/retificação

  @Column()
  adjustedBy: string; // Nome do operador / responsável

  @CreateDateColumn()
  createdAt: Date;
}
