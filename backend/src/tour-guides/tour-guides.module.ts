import { Module } from '@nestjs/common';
import { TourGuidesController } from './tour-guides.controller';

@Module({
  controllers: [TourGuidesController],
})
export class TourGuidesModule {}
