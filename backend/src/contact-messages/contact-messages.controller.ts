import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/contact-messages')
export class ContactMessagesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() body: { name: string; email: string; message: string }) {
    await this.prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        message: body.message,
      },
    });

    return {
      status: 'success',
      message: 'Your message has been submitted successfully.',
    };
  }

  @Get()
  async findAll() {
    const messages = await this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { status: 'success', data: messages };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return { status: 'error', message: 'Message not found' };
    return { status: 'success', data: message };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.contactMessage.delete({ where: { id } });
    return { status: 'success', message: 'Message deleted' };
  }
}
