import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/taxis')
export class TaxisController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { location?: string; type?: string }) {
    const where: any = { isActive: true };
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };
    if (query.type) where.type = query.type;

    const taxis = await this.prisma.taxi.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      data: taxis.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        image: t.image,
        driver_name: t.driverName,
        driver_phone: t.driverPhone,
        location: t.location,
        type: t.type,
        capacity: t.capacity,
        price_per_km: t.pricePerKm ? Number(t.pricePerKm) : null,
        description: t.description,
        amenities: t.amenities ? JSON.parse(t.amenities) : [],
        is_active: t.isActive,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const taxi = await this.prisma.taxi.findUnique({ where: { id } });
    if (!taxi) return { status: 'error', message: 'Taxi not found' };
    return {
      status: 'success',
      data: {
        ...taxi,
        price_per_km: taxi.pricePerKm ? Number(taxi.pricePerKm) : null,
        amenities: taxi.amenities ? JSON.parse(taxi.amenities) : [],
      },
    };
  }

  @Post()
  async create(@Body() body: any) {
    const taxi = await this.prisma.taxi.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        image: body.image,
        driverName: body.driver_name,
        driverPhone: body.driver_phone,
        location: body.location,
        type: body.type || 'car',
        capacity: body.capacity || 4,
        pricePerKm: body.price_per_km ? parseFloat(body.price_per_km) : null,
        description: body.description,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
      },
    });
    return { status: 'success', data: taxi };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const taxi = await this.prisma.taxi.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        image: body.image,
        driverName: body.driver_name,
        driverPhone: body.driver_phone,
        location: body.location,
        type: body.type,
        capacity: body.capacity,
        pricePerKm: body.price_per_km ? parseFloat(body.price_per_km) : null,
        description: body.description,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        isActive: body.is_active,
      },
    });
    return { status: 'success', data: taxi };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.taxi.delete({ where: { id } });
    return { status: 'success', message: 'Taxi deleted successfully' };
  }
}
