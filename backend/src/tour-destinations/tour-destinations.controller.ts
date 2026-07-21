import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateDestinationDto, UpdateDestinationDto } from './dto/create-destination.dto';

@Controller('api/destinations')
export class TourDestinationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const destinations = await this.prisma.tourDestination.findMany({
      orderBy: [{ rating: 'desc' }, { title: 'asc' }],
      include: {
        _count: { select: { guides: true } },
      },
    });

    return {
      status: 'success',
      data: destinations.map((d) => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        country: d.country,
        city: d.city,
        location_label: d.locationLabel,
        image: d.image,
        short_description: d.shortDescription,
        description: d.description,
        duration: d.duration,
        price: d.price,
        rating: d.rating,
        guides_count: d._count.guides,
      })),
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateDestinationDto) {
    // Support both 'title' (DTO) and 'name' (admin panel legacy)
    const title = body.name || body.title;
    const destination = await this.prisma.tourDestination.create({
      data: {
        slug: body.slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: title,
        country: body.country || '',
        city: body.city || '',
        locationLabel: body.location_label || '',
        image: body.image || '',
        shortDescription: body.short_description || '',
        description: body.description || '',
        duration: body.duration || '',
        price: body.price ? String(body.price) : '',
        rating: body.rating || 0,

      },
    });
    return { status: 'success', data: destination };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDestinationDto) {
    const data: any = {};
    const title = body.name || body.title;
    if (title) data.title = title;
    if (body.slug) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description;
    if (body.image !== undefined) data.image = body.image;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.is_active !== undefined) data.isActive = body.is_active;
    if (body.country !== undefined) data.country = body.country;
    if (body.city !== undefined) data.city = body.city;

    const destination = await this.prisma.tourDestination.update({ where: { id }, data });
    return { status: 'success', data: destination };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.tourDestination.delete({ where: { id } });
    return { status: 'success', message: 'Destination deleted' };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const destination = await this.prisma.tourDestination.findUnique({
      where: { slug },
      include: {
        _count: { select: { guides: true } },
        guides: {
          orderBy: [{ rating: 'desc' }, { experienceYears: 'desc' }, { name: 'asc' }],
        },
      },
    });

    if (!destination) {
      return { status: 'error', message: 'Destination not found' };
    }

    return {
      status: 'success',
      data: {
        id: destination.id,
        slug: destination.slug,
        title: destination.title,
        country: destination.country,
        city: destination.city,
        location_label: destination.locationLabel,
        image: destination.image,
        short_description: destination.shortDescription,
        description: destination.description,
        duration: destination.duration,
        price: destination.price,
        rating: destination.rating,
        guides_count: destination._count.guides,
        guides: destination.guides.map((g) => ({
          id: g.id,
          destination_id: g.destinationId,
          name: g.name,
          photo: g.photo,
          description: g.description,
          rating: g.rating,
          location: g.location,
          experience_years: g.experienceYears,
          languages: g.languages,
          hire_cost: g.hireCost ? Number(g.hireCost) : null,
          phone: g.phone,
          email: g.email,
        })),
      },
    };
  }
}
