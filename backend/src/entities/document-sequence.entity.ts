import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Contador da numeração das faturas, uma linha por série (ex.: "FR-2026").
 * É incrementado dentro da mesma transacção que grava a fatura, por isso:
 *  - nunca repete um número, mesmo com duas vendas ao mesmo tempo;
 *  - nunca deixa buracos (se a venda falhar, o contador volta atrás);
 *  - não depende de contar faturas, por isso apagar/limpar dados NÃO o reinicia.
 */
@Entity('document_sequences')
export class DocumentSequence {
  @PrimaryColumn()
  key: string; // "FR-2026"

  @Column({ type: 'int', default: 0 })
  lastNumber: number;
}
