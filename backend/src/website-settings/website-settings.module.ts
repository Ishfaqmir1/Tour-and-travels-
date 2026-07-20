import { Module } from '@nestjs/common';
import { WebsiteSettingsController } from './website-settings.controller';

@Module({
  controllers: [WebsiteSettingsController],
})
export class WebsiteSettingsModule {}
