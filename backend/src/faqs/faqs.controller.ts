import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateFaqDto, UpdateFaqDto } from './dto/create-faq.dto';

@Controller('api/faqs')
export class FaqsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { category?: string }) {
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;

    const faqs = await this.prisma.generalFAQ.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
    return { status: 'success', data: faqs };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.prisma.generalFAQ.groupBy({
      by: ['category'],
      where: { isActive: true, category: { not: null } },
      _count: { id: true },
    });
    return {
      status: 'success',
      data: categories.map((c) => ({ category: c.category, count: c._count.id })),
    };
  }

  @Get('all')
  async findAllAdmin() {
    const faqs = await this.prisma.generalFAQ.findMany({
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
    return { status: 'success', data: faqs };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const faq = await this.prisma.generalFAQ.findUnique({ where: { id } });
    if (!faq) return { status: 'error', message: 'FAQ not found' };
    return { status: 'success', data: faq };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateFaqDto) {
    const faq = await this.prisma.generalFAQ.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category,
        sortOrder: body.sort_order || 0,
      },
    });
    return { status: 'success', data: faq };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateFaqDto) {
    const faq = await this.prisma.generalFAQ.update({
      where: { id },
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category,
        sortOrder: body.sort_order,
        isActive: body.is_active,
      },
    });
    return { status: 'success', data: faq };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.generalFAQ.delete({ where: { id } });
    return { status: 'success', message: 'FAQ deleted' };
  }
}
