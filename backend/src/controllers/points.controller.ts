import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PointsService } from '../services/points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  async getPoints() {
    return this.pointsService.findAll();
  }

  @Post()
  async createPoint(
    @Body() body: { name: string; location?: string; assignedOperatorName?: string; initialCash?: number },
  ) {
    return this.pointsService.createPoint(body);
  }

  @Post(':id/update')
  async updatePoint(
    @Param('id') id: string,
    @Body() body: { name?: string; location?: string; assignedOperatorName?: string },
  ) {
    return this.pointsService.updatePoint(id, body);
  }

  @Get('adjustments')
  async getAllAdjustments() {
    return this.pointsService.getAdjustments();
  }

  @Post(':id/adjust-balance')
  async adjustBalance(
    @Param('id') id: string,
    @Body() body: { newBalance: number; reason: string; operatorName: string },
  ) {
    return this.pointsService.adjustCashBalance(
      id,
      Number(body.newBalance),
      body.reason,
      body.operatorName,
    );
  }

  @Get(':id/expenses')
  async getExpenses(@Param('id') id: string) {
    return this.pointsService.getExpenses(id);
  }

  @Post(':id/expenses')
  async addExpense(
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string; operatorName: string },
  ) {
    return this.pointsService.addExpense(id, Number(body.amount), body.reason, body.operatorName);
  }

  @Post(':id/open')
  async openShift(
    @Param('id') id: string,
    @Body() body: { operatorName: string; openingCash: number },
  ) {
    return this.pointsService.openShift(id, body.operatorName, Number(body.openingCash));
  }

  @Post(':id/close')
  async closeShift(
    @Param('id') id: string,
    @Body() body: { declaredCash: number },
  ) {
    return this.pointsService.closeShift(id, Number(body.declaredCash));
  }
}
