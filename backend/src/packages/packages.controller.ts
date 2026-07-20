import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller('api/packages')
export class PackagesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query() query: {
      page?: string; limit?: string; search?: string;
      destination_id?: string; min_price?: string; max_price?: string;
      duration?: string; sort_by?: string; sort_order?: string;
      is_featured?: string; is_active?: string;
    },
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '12', 10), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.is_active !== 'false') where.isActive = true;
    if (query.is_featured === 'true') where.isFeatured = true;
    if (query.destination_id) where.destinationId = parseInt(query.destination_id, 10);
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' as const } },
        { location: { contains: query.search, mode: 'insensitive' as const } },
        { country: { contains: query.search, mode: 'insensitive' as const } },
        { overview: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }
    if (query.min_price) where.price = { ...where.price, gte: parseFloat(query.min_price) };
    if (query.max_price) where.price = { ...where.price, lte: parseFloat(query.max_price) };
    if (query.duration) where.duration = { contains: query.duration, mode: 'insensitive' as const };

    const orderBy: any = {};
    const sortField = query.sort_by || 'createdAt';
    const sortOrder = query.sort_order === 'asc' ? 'asc' as const : 'desc' as const;
    if (sortField === 'price') orderBy.price = sortOrder;
    else if (sortField === 'rating') orderBy.rating = sortOrder;
    else if (sortField === 'title') orderBy.title = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [packages, total] = await Promise.all([
      this.prisma.package.findMany({
        where, orderBy, skip, take: limit,
        include: {
          destination: { select: { id: true, title: true, slug: true } },
          _count: { select: { days: true, faqs: true, reviews: true, bookings: true } },
        },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      status: 'success',
      data: packages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        image: p.image,
        images: p.images ? JSON.parse(p.images) : [],
        video: p.video,
        location: p.location,
        country: p.country,
        destination: p.destination,
        duration: p.duration,
        price: Number(p.price),
        discount_percent: p.discountPercent,
        rating: p.rating,
        review_count: p.reviewCount,
        overview: p.overview,
        highlights: p.highlights ? JSON.parse(p.highlights) : [],
        is_featured: p.isFeatured,
        is_active: p.isActive,
        days_count: p._count.days,
        reviews_count: p._count.reviews,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { slug },
      include: {
        destination: true,
        days: { orderBy: { dayNumber: 'asc' } },
        faqs: { orderBy: { sortOrder: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!pkg) return { status: 'error', message: 'Package not found' };

    return {
      status: 'success',
      data: {
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        image: pkg.image,
        images: pkg.images ? JSON.parse(pkg.images) : [],
        video: pkg.video,
        location: pkg.location,
        country: pkg.country,
        destination: pkg.destination ? {
          id: pkg.destination.id,
          title: pkg.destination.title,
          slug: pkg.destination.slug,
          image: pkg.destination.image,
          country: pkg.destination.country,
        } : null,
        duration: pkg.duration,
        price: Number(pkg.price),
        discount_percent: pkg.discountPercent,
        rating: pkg.rating,
        review_count: pkg.reviewCount,
        overview: pkg.overview,
        highlights: pkg.highlights ? JSON.parse(pkg.highlights) : [],
        included: pkg.included ? JSON.parse(pkg.included) : [],
        excluded: pkg.excluded ? JSON.parse(pkg.excluded) : [],
        hotels: pkg.hotels ? JSON.parse(pkg.hotels) : [],
        meals: pkg.meals ? JSON.parse(pkg.meals) : [],
        transportation: pkg.transportation,
        best_season: pkg.bestSeason,
        cancellation_policy: pkg.cancellationPolicy,
        is_featured: pkg.isFeatured,
        days: pkg.days.map((d) => ({
          id: d.id,
          day_number: d.dayNumber,
          title: d.title,
          description: d.description,
          activities: d.activities ? JSON.parse(d.activities) : [],
          meals: d.meals,
          hotel: d.hotel,
        })),
        faqs: pkg.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
        reviews: pkg.reviews.map((r) => ({
          id: r.id, rating: r.rating, comment: r.comment,
          user: r.user, created_at: r.createdAt,
        })),
      },
    };
  }

  @Post()
  async create(@Body() body: any) {
    const pkg = await this.prisma.package.create({
      data: {
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: body.title,
        image: body.image,
        images: body.images ? JSON.stringify(body.images) : null,
        video: body.video,
        location: body.location,
        country: body.country,
        destinationId: body.destination_id ? parseInt(body.destination_id, 10) : null,
        duration: body.duration,
        price: parseFloat(body.price),
        discountPercent: body.discount_percent ? parseInt(body.discount_percent, 10) : 0,
        rating: body.rating || 0,
        overview: body.overview,
        highlights: body.highlights ? JSON.stringify(body.highlights) : null,
        included: body.included ? JSON.stringify(body.included) : null,
        excluded: body.excluded ? JSON.stringify(body.excluded) : null,
        hotels: body.hotels ? JSON.stringify(body.hotels) : null,
        meals: body.meals ? JSON.stringify(body.meals) : null,
        transportation: body.transportation,
        bestSeason: body.best_season,
        cancellationPolicy: body.cancellation_policy,
        isFeatured: body.is_featured || false,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
      },
    });
    return { status: 'success', data: pkg };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const pkg = await this.prisma.package.update({
      where: { id },
      data: {
        title: body.title,
        image: body.image,
        images: body.images ? JSON.stringify(body.images) : undefined,
        video: body.video,
        location: body.location,
        country: body.country,
        destinationId: body.destination_id ? parseInt(body.destination_id, 10) : null,
        duration: body.duration,
        price: body.price ? parseFloat(body.price) : undefined,
        discountPercent: body.discount_percent !== undefined ? parseInt(body.discount_percent, 10) : undefined,
        overview: body.overview,
        highlights: body.highlights ? JSON.stringify(body.highlights) : undefined,
        included: body.included ? JSON.stringify(body.included) : undefined,
        excluded: body.excluded ? JSON.stringify(body.excluded) : undefined,
        hotels: body.hotels ? JSON.stringify(body.hotels) : undefined,
        meals: body.meals ? JSON.stringify(body.meals) : undefined,
        transportation: body.transportation,
        bestSeason: body.best_season,
        cancellationPolicy: body.cancellation_policy,
        isFeatured: body.is_featured,
        isActive: body.is_active,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
      },
    });
    return { status: 'success', data: pkg };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.package.delete({ where: { id } });
    return { status: 'success', message: 'Package deleted successfully' };
  }
}
