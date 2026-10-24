import { timingSafeEqual } from 'crypto';
import {
  Controller,
  Post,
  Body,
  Headers,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

function keysMatch(received: string | undefined, expected: string): boolean {
  const a = Buffer.from(received ?? '');
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

@Controller('admin')
export class AdminController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * APAGA faturas, turnos, despesas, transferências e ajustes, e zera saldos.
   * Só funciona se TODAS estas condições forem verdadeiras:
   *  1) o servidor tem a variável ADMIN_RESET_KEY definida;
   *  2) o pedido traz essa chave no cabeçalho "x-admin-key";
   *  3) o corpo traz confirm = "LIMPAR".
   * Sem a chave, ninguém (nem por engano, nem por URL) consegue reiniciar os dados.
   */
  @Post('reset-data')
  async resetData(
    @Headers('x-admin-key') adminKey: string | undefined,
    @Body() body: { operatorName?: string; reason?: string; confirm?: string },
  ) {
    const expected = process.env.ADMIN_RESET_KEY;
    if (!expected) {
      throw new ForbiddenException(
        'Reinicialização desactivada: defina ADMIN_RESET_KEY no servidor para a permitir.',
      );
    }
    if (!keysMatch(adminKey, expected)) {
      throw new ForbiddenException('Chave de administrador incorrecta.');
    }
    if (body?.confirm !== 'LIMPAR') {
      throw new BadRequestException('Confirmação em falta (confirm = "LIMPAR").');
    }

    const operator = body?.operatorName || 'Administrador';
    const reason = body?.reason || 'Reinicialização manual de dados do sistema';

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Faturas e itens
      await queryRunner.query('DELETE FROM invoice_items');
      await queryRunner.query('DELETE FROM invoices');

      // 2. Numeração: recomeça em FR AAAA/0001 (só acontece neste pedido explícito)
      await queryRunner.query('DELETE FROM document_sequences');

      // 3. Despesas, transferências, turnos
      await queryRunner.query('DELETE FROM cash_expenses');
      await queryRunner.query('DELETE FROM balance_transfers');
      await queryRunner.query('DELETE FROM shifts');

      // 4. Ajustes anteriores
      await queryRunner.query('DELETE FROM balance_adjustments');

      // 5. Zerar carteiras e pontos
      await queryRunner.query('UPDATE wallets SET balance = 0');
      await queryRunner.query(
        'UPDATE sale_points SET "currentCashBalance" = 0, "isOpen" = false, "currentOperatorName" = NULL',
      );

      // 6. Registo de auditoria da própria reinicialização
      await queryRunner.query(
        `INSERT INTO balance_adjustments ("id", "targetType", "targetId", "targetName", "previousBalance", "newBalance", "difference", "reason", "adjustedBy", "createdAt")
         VALUES (gen_random_uuid(), 'WALLET', NULL, 'Sistema Completo', 0, 0, 0, $1, $2, NOW())`,
        [reason, operator],
      );

      await queryRunner.commitTransaction();

      const points = await queryRunner.query('SELECT * FROM sale_points ORDER BY name ASC');
      const wallets = await queryRunner.query('SELECT * FROM wallets ORDER BY name ASC');

      return {
        success: true,
        message: 'Todos os dados foram reinicializados com sucesso.',
        points,
        wallets,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
