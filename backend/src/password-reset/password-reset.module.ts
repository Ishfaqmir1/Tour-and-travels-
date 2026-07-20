import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';

@Module({
  controllers: [PasswordResetController],
})
export class PasswordResetModule {}
