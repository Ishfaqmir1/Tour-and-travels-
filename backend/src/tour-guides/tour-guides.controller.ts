import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateTourGuideDto, UpdateTourGuideDto } from './dto/create-tour-guide.dto';

@Controller('api/tour-guides')
export class TourGuidesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('location') location?: string,
    @Query('destination_id') destinationId?: string,
    @Query('destination_slug') destinationSlug?: string,
  ) {
    const where: any = {};

    if (destinationId) {
      where.destinationId = parseInt(destinationId, 10);
    }

    if (destinationSlug) {
      where.destination = { slug: destinationSlug };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const guides = await this.prisma.tourGuide.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { experienceYears: 'desc' }],
      include: {
        destination: {
          select: { id: true, slug: true, title: true, country: true, city: true, locationLabel: true },
        },
      },
    });

    return {
      status: 'success',
      data: guides.map((g) => ({
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
        destination: g.destination
          ? {
              id: g.destination.id,
              slug: g.destination.slug,
              title: g.destination.title,
              country: g.destination.country,
              city: g.destination.city,
              location_label: g.destination.locationLabel,
            }
          : null,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    const guide = await this.prisma.tourGuide.findUnique({
      where: { id: numericId },
      include: {
        destination: {
          select: { id: true, slug: true, title: true, country: true, city: true, locationLabel: true },
        },
      },
    });

    if (!guide) {
      return { status: 'error', message: 'Tour guide not found' };
    }

    return {
      status: 'success',
      data: {
        id: guide.id,
        destination_id: guide.destinationId,
        name: guide.name,
        photo: guide.photo,
        description: guide.description,
        rating: guide.rating,
        location: guide.location,
        experience_years: guide.experienceYears,
        languages: guide.languages,
        hire_cost: guide.hireCost ? Number(guide.hireCost) : null,
        phone: guide.phone,
        email: guide.email,
        destination: guide.destination
          ? {
              id: guide.destination.id,
              slug: guide.destination.slug,
              title: guide.destination.title,
              country: guide.destination.country,
              city: guide.destination.city,
              location_label: guide.destination.locationLabel,
            }
          : null,
      },
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateTourGuideDto) {
    const guide = await this.prisma.tourGuide.create({
      data: {
        name: body.name,
        photo: body.photo || '',
        description: body.description || '',
        rating: body.rating ?? 5,
        location: body.location || '',
        experienceYears: body.experience_years ?? 0,
        languages: body.languages || '',
        hireCost: body.hire_cost ?? null,
        phone: body.phone || null,
        email: body.email || null,
        destinationId: body.destination_id ?? null,
      },
    });
    return { status: 'success', data: guide };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTourGuideDto) {
    const guide = await this.prisma.tourGuide.update({
      where: { id },
      data: {
        name: body.name,
        photo: body.photo,
        description: body.description,
        rating: body.rating,
        location: body.location,
        experienceYears: body.experience_years,
        languages: body.languages,
        hireCost: body.hire_cost,
        phone: body.phone,
        email: body.email,
        destinationId: body.destination_id !== undefined
          ? (body.destination_id ?? null)
          : undefined,
      },
    });
    return { status: 'success', data: guide };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.tourGuide.delete({ where: { id } });
    return { status: 'success', message: 'Tour guide deleted successfully' };
  }
}
