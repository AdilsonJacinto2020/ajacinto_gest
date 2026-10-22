import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('balance_transfers')
export class BalanceTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originName: string;

  @Column()
  destinationName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  transferredBy: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
