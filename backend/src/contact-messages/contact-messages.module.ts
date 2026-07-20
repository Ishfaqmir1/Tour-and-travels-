import { Module } from '@nestjs/common';
import { ContactMessagesController } from './contact-messages.controller';

@Module({
  controllers: [ContactMessagesController],
})
export class ContactMessagesModule {}
