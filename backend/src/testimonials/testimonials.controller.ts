import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/testimonials')
export class TestimonialsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const testimonials = await this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { status: 'success', data: testimonials };
  }

  @Get('all')
  async findAllAdmin() {
    const testimonials = await this.prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    return { status: 'success', data: testimonials };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) return { status: 'error', message: 'Testimonial not found' };
    return { status: 'success', data: testimonial };
  }

  @Post()
  async create(@Body() body: any) {
    const testimonial = await this.prisma.testimonial.create({
      data: {
        name: body.name, location: body.location, avatar: body.avatar,
        content: body.content, rating: body.rating || 5, sortOrder: body.sort_order || 0,
      },
    });
    return { status: 'success', data: testimonial };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const testimonial = await this.prisma.testimonial.update({
      where: { id },
      data: {
        name: body.name, location: body.location, avatar: body.avatar,
        content: body.content, rating: body.rating,
        sortOrder: body.sort_order, isActive: body.is_active,
      },
    });
    return { status: 'success', data: testimonial };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.testimonial.delete({ where: { id } });
    return { status: 'success', message: 'Testimonial deleted' };
  }
}
