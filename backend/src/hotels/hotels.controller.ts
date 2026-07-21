import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateHotelDto, UpdateHotelDto } from './dto/create-hotel.dto';

@Controller('api/hotels')
export class HotelsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { location?: string; stars?: string; min_price?: string; max_price?: string }) {
    const where: any = { isActive: true };
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' as const };
    if (query.stars) where.stars = parseInt(query.stars, 10);
    if (query.min_price || query.max_price) {
      where.pricePerNight = {};
      if (query.min_price) where.pricePerNight.gte = parseFloat(query.min_price);
      if (query.max_price) where.pricePerNight.lte = parseFloat(query.max_price);
    }

    const hotels = await this.prisma.hotel.findMany({ where, orderBy: [{ stars: 'desc' }, { name: 'asc' }] });
    return {
      status: 'success',
      data: hotels.map((h) => ({
        ...h,
        images: h.images ? JSON.parse(h.images) : [],
        amenities: h.amenities ? JSON.parse(h.amenities) : [],
        price_per_night: h.pricePerNight ? Number(h.pricePerNight) : null,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) return { status: 'error', message: 'Hotel not found' };
    return {
      status: 'success',
      data: {
        ...hotel,
        images: hotel.images ? JSON.parse(hotel.images) : [],
        amenities: hotel.amenities ? JSON.parse(hotel.amenities) : [],
        price_per_night: hotel.pricePerNight ? Number(hotel.pricePerNight) : null,
      },
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateHotelDto) {
    const hotel = await this.prisma.hotel.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        image: body.image,
        images: body.images ? JSON.stringify(body.images) : null,
        location: body.location,
        stars: body.stars || 3,
        description: body.description,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        pricePerNight: body.price_per_night ?? null,
      },
    });
    return { status: 'success', data: hotel };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateHotelDto) {
    const hotel = await this.prisma.hotel.update({
      where: { id },
      data: {
        name: body.name, slug: body.slug, image: body.image,
        images: body.images ? JSON.stringify(body.images) : undefined,
        location: body.location, stars: body.stars,
        description: body.description,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        pricePerNight: body.price_per_night ?? null,
        isActive: body.is_active,
      },
    });
    return { status: 'success', data: hotel };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.hotel.delete({ where: { id } });
    return { status: 'success', message: 'Hotel deleted' };
  }
}
