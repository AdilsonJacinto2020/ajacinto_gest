import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalePoint } from '../entities/sale-point.entity';
import { Shift, ShiftStatus } from '../entities/shift.entity';
import { CashExpense } from '../entities/cash-expense.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(SalePoint)
    private readonly pointRepo: Repository<SalePoint>,
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
    @InjectRepository(CashExpense)
    private readonly expenseRepo: Repository<CashExpense>,
  ) {}

  async findAll() {
    return this.pointRepo.find({ order: { name: 'ASC' } });
  }

  // Criar novo Ponto de Venda
  async createPoint(data: { name: string; location?: string; assignedOperatorName?: string; initialCash?: number }) {
    const point = this.pointRepo.create({
      name: data.name,
      location: data.location || 'Luanda',
      assignedOperatorName: data.assignedOperatorName || null,
      currentCashBalance: data.initialCash || 0,
      isOpen: false,
    });
    return this.pointRepo.save(point);
  }

  // Atualizar / Renomear Ponto e alocar operador
  async updatePoint(id: string, data: { name?: string; location?: string; assignedOperatorName?: string }) {
    const point = await this.pointRepo.findOneBy({ id });
    if (!point) throw new Error('Ponto não encontrado');

    if (data.name !== undefined) point.name = data.name;
    if (data.location !== undefined) point.location = data.location;
    if (data.assignedOperatorName !== undefined) point.assignedOperatorName = data.assignedOperatorName;

    return this.pointRepo.save(point);
  }

  // Registar Saída / Despesa de Dinheiro no Ponto
  async addExpense(pointId: string, amount: number, reason: string, operatorName: string) {
    const point = await this.pointRepo.findOneBy({ id: pointId });
    if (!point) throw new Error('Ponto não encontrado');

    if (Number(point.currentCashBalance) < Number(amount)) {
      throw new Error('Saldo em caixa insuficiente para esta saída');
    }

    point.currentCashBalance = Number(point.currentCashBalance) - Number(amount);
    await this.pointRepo.save(point);

    const expense = this.expenseRepo.create({
      salePoint: point,
      amount,
      reason,
      operatorName,
    });
    return this.expenseRepo.save(expense);
  }

  // Listar saídas de caixa
  async getExpenses(pointId?: string) {
    if (pointId) {
      return this.expenseRepo.find({
        where: { salePoint: { id: pointId } },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    }
    return this.expenseRepo.find({ order: { createdAt: 'DESC' }, take: 50 });
  }

  async openShift(pointId: string, operatorName: string, openingCash: number) {
    const point = await this.pointRepo.findOneBy({ id: pointId });
    if (!point) throw new Error('Ponto não encontrado');

    const shift = this.shiftRepo.create({
      salePoint: point,
      operatorName,
      openedAt: new Date(),
      openingCash,
      status: ShiftStatus.OPEN,
    });
    const savedShift = await this.shiftRepo.save(shift);

    point.isOpen = true;
    point.currentOperatorName = operatorName;
    point.currentCashBalance = openingCash;
    await this.pointRepo.save(point);

    return { point, shift: savedShift };
  }

  async closeShift(pointId: string, declaredCash: number) {
    const point = await this.pointRepo.findOneBy({ id: pointId });
    if (!point) throw new Error('Ponto não encontrado');

    const openShift = await this.shiftRepo.findOne({
      where: { salePoint: { id: pointId }, status: ShiftStatus.OPEN },
      order: { openedAt: 'DESC' },
    });

    if (openShift) {
      openShift.status = ShiftStatus.CLOSED;
      openShift.closedAt = new Date();
      openShift.closingCashCalculated = Number(point.currentCashBalance);
      openShift.closingCashDeclared = declaredCash;
      await this.shiftRepo.save(openShift);
    }

    point.isOpen = false;
    point.currentOperatorName = null;
    await this.pointRepo.save(point);

    return { success: true, point };
  }

  async seedDefaultPoints() {
    const count = await this.pointRepo.count();
    if (count === 0) {
      await this.pointRepo.save([
        {
          name: 'Ponto Morro Bento (Sede)',
          location: 'Distrito Urbano de Samba, Morro Bento, junto ao Imetro',
          currentCashBalance: 125000,
          isOpen: true,
          currentOperatorName: 'Adilson Jacinto',
        },
        {
          name: 'Ponto Balcão Imetro',
          location: 'Rua Principal do Imetro',
          currentCashBalance: 45000,
          isOpen: false,
        },
      ]);
    }
  }
}
