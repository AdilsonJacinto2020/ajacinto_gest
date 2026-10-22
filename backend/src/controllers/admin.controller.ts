import { Controller, Post, Body } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Post('reset-data')
  async resetData(@Body() body: { operatorName?: string; reason?: string }) {
    const operator = body?.operatorName || 'Administrador';
    const reason = body?.reason || 'Reinicialização manual de dados do sistema';

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Limpar faturas e itens
      await queryRunner.query('DELETE FROM invoice_items');
      await queryRunner.query('DELETE FROM invoices');

      // 2. Limpar despesas, transferências, turnos
      await queryRunner.query('DELETE FROM cash_expenses');
      await queryRunner.query('DELETE FROM balance_transfers');
      await queryRunner.query('DELETE FROM shifts');

      // 3. Limpar ajustes anteriores e gravar um registo de reinício
      await queryRunner.query('DELETE FROM balance_adjustments');

      // 4. Zerar carteiras e pontos
      await queryRunner.query('UPDATE wallets SET balance = 0');
      await queryRunner.query(
        'UPDATE sale_points SET "currentCashBalance" = 0, "isOpen" = false, "currentOperatorName" = NULL',
      );

      // 5. Inserir registo de auditoria inicial
      await queryRunner.query(
        `INSERT INTO balance_adjustments ("id", "targetType", "targetId", "targetName", "previousBalance", "newBalance", "difference", "reason", "adjustedBy", "createdAt")
         VALUES (gen_random_uuid(), 'WALLET', NULL, 'Sistema Completo', 0, 0, 0, $1, $2, NOW())`,
        [reason, operator],
      );

      await queryRunner.commitTransaction();

      // Devolver novo estado limpo
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
