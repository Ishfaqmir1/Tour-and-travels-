import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('api/bookings')
export class BookingsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any, @Query() query: { user_id?: string; status?: string; page?: string; limit?: string }) {
    const isAdmin = !!(req.user?.isSuperAdmin || req.user?.is_super_admin);
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;
    const where: any = {};

    // Non-admin users can only see their own bookings
    if (!isAdmin) {
      where.userId = req.user.id;
    } else if (query.user_id) {
      where.userId = parseInt(query.user_id, 10);
    }

    if (query.status) where.status = query.status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          package: { select: { id: true, title: true, slug: true, image: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      status: 'success',
      data: bookings.map((b) => ({
        id: b.id, transaction_id: b.transactionId, amount: Number(b.amount),
        currency: b.currency, travelers: b.travelers, status: b.status,
        customer_name: b.customerName, customer_email: b.customerEmail,
        customer_phone: b.customerPhone, special_requests: b.specialRequests,
        travel_date: b.travelDate, paid_at: b.paidAt,
        user: b.user, package: b.package, created_at: b.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        package: { select: { id: true, title: true, slug: true, image: true, duration: true } },
      },
    });
    if (!booking) return { status: 'error', message: 'Booking not found' };

    // Non-admin users can only view their own bookings
    const isAdmin = !!(req.user?.isSuperAdmin || req.user?.is_super_admin);
    if (!isAdmin && booking.userId !== req.user.id) {
      return { status: 'error', message: 'Booking not found' };
    }

    return { status: 'success', data: booking };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: CreateBookingDto) {
    // Use authenticated user's ID; prevent impersonation
    const userId = req.user.id;

    // Validate the package exists and get its price
    const pkg = await this.prisma.package.findUnique({ where: { id: body.package_id } });
    if (!pkg) {
      return { status: 'error', message: 'Package not found' };
    }

    // Calculate expected amount from package price
    const travelers = body.travelers || 1;
    const discountPercent = pkg.discountPercent || 0;
    const expectedAmount = Number(pkg.price) * travelers * (1 - discountPercent / 100);

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        packageId: pkg.id,
        transactionId: body.transaction_id || `TXN-${Date.now()}`,
        amount: expectedAmount,
        currency: body.currency || 'USD',
        travelers,
        status: (body.status || 'pending') as BookingStatus,
        customerName: body.customer_name,
        customerEmail: body.customer_email,
        customerPhone: body.customer_phone,
        specialRequests: body.special_requests,
        travelDate: body.travel_date ? new Date(body.travel_date) : null,
        paidAt: body.status === 'confirmed' ? new Date() : null,
      },
    });
    return { status: 'success', data: booking };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.booking.delete({ where: { id } });
    return { status: 'success', message: 'Booking deleted' };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data: any = {};
    if (body.status) data.status = body.status;
    if (body.travelers) data.travelers = body.travelers;
    if (body.special_requests !== undefined) data.specialRequests = body.special_requests;
    if (body.travel_date) data.travelDate = new Date(body.travel_date);
    if (body.status === 'confirmed') data.paidAt = new Date();

    const booking = await this.prisma.booking.update({ where: { id }, data });
    return { status: 'success', data: booking };
  }
}
