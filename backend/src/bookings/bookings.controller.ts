import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/bookings')
export class BookingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { user_id?: string; status?: string; page?: string; limit?: string }) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 50);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.user_id) where.userId = parseInt(query.user_id, 10);
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        package: { select: { id: true, title: true, slug: true, image: true, duration: true } },
      },
    });
    if (!booking) return { status: 'error', message: 'Booking not found' };
    return { status: 'success', data: booking };
  }

  @Post()
  async create(@Body() body: any) {
    const booking = await this.prisma.booking.create({
      data: {
        userId: parseInt(body.user_id, 10),
        packageId: parseInt(body.package_id, 10),
        transactionId: body.transaction_id || `TXN-${Date.now()}`,
        amount: parseFloat(body.amount),
        currency: body.currency || 'USD',
        travelers: body.travelers || 1,
        status: body.status || 'pending',
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

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.booking.delete({ where: { id } });
    return { status: 'success', message: 'Booking deleted' };
  }

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
