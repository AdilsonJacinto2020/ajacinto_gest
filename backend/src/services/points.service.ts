import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalePoint } from '../entities/sale-point.entity';
import { Shift, ShiftStatus } from '../entities/shift.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(SalePoint)
    private readonly pointRepo: Repository<SalePoint>,
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
  ) {}

  async findAll() {
    return this.pointRepo.find({ order: { name: 'ASC' } });
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
