import { Module } from '@nestjs/common';
import { TourDestinationsController } from './tour-destinations.controller';

@Module({
  controllers: [TourDestinationsController],
})
export class TourDestinationsModule {}
