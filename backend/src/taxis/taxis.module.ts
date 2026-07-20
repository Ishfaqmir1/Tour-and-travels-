import { Module } from '@nestjs/common';
import { TaxisController } from './taxis.controller';

@Module({
  controllers: [TaxisController],
})
export class TaxisModule {}
