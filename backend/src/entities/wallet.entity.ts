import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WalletType {
  MSELLER = 'MSELLER',
  AFRIMONEY = 'AFRIMONEY',
  TELPLAY_ZAP = 'TELPLAY_ZAP',
  CAIXA_GERAL = 'CAIXA_GERAL',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WalletType,
    unique: true,
  })
  type: WalletType;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
