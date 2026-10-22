import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PointsService } from '../services/points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  async getPoints() {
    return this.pointsService.findAll();
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
