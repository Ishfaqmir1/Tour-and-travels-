import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const guide = await this.prisma.tourGuide.findUnique({
      where: { id: parseInt(id, 10) },
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
}
