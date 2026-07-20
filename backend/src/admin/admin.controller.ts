import { Controller, Get, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhotoPath: true,
        createdAt: true,
      },
    });

    return {
      status: 'success',
      data: users,
    };
  }

  @Get('bookings')
  async getBookings() {
    const payments = await this.prisma.payment.findMany({
      orderBy: { paidAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        guide: {
          select: {
            id: true,
            name: true,
            location: true,
            hireCost: true,
            destination: {
              select: { id: true, title: true, locationLabel: true, country: true, city: true },
            },
          },
        },
      },
    });

    return {
      status: 'success',
      data: payments.map((p) => ({
        id: p.id,
        transaction_id: p.transactionId,
        status: p.status,
        days: p.days,
        start_date: p.paidAt.toISOString(),
        end_date: new Date(p.paidAt.getTime() + p.days * 86400000).toISOString(),
        amount: Number(p.amount),
        currency: p.currency,
        user: p.user,
        guide: p.guide
          ? {
              id: p.guide.id,
              name: p.guide.name,
              location: p.guide.location,
              hire_cost: p.guide.hireCost ? Number(p.guide.hireCost) : null,
              destination: p.guide.destination
                ? {
                    id: p.guide.destination.id,
                    title: p.guide.destination.title,
                    location_label: p.guide.destination.locationLabel,
                    country: p.guide.destination.country,
                    city: p.guide.destination.city,
                  }
                : null,
            }
          : null,
      })),
    };
  }

  @Put('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; email?: string; phone?: string; isSuperAdmin?: boolean }) {
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.isSuperAdmin !== undefined) data.isSuperAdmin = body.isSuperAdmin;

    const user = await this.prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, phone: true, isSuperAdmin: true, createdAt: true } });
    return { status: 'success', data: user };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { status: 'success', message: 'User deleted' };
  }

  @Get('payments')
  async getPayments() {
    const payments = await this.prisma.payment.findMany({
      orderBy: { paidAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        guide: { select: { id: true, name: true, location: true, hireCost: true } },
      },
    });

    return {
      status: 'success',
      data: payments.map((p) => ({
        id: p.id,
        transaction_id: p.transactionId,
        amount: Number(p.amount),
        currency: p.currency,
        days: p.days,
        status: p.status,
        card_holder_name: p.cardHolderName,
        card_brand: p.cardBrand,
        card_last_four: p.cardLastFour,
        paid_at: p.paidAt.toISOString(),
        user: p.user,
        guide: p.guide
          ? {
              id: p.guide.id,
              name: p.guide.name,
              location: p.guide.location,
              hire_cost: p.guide.hireCost ? Number(p.guide.hireCost) : null,
            }
          : null,
      })),
    };
  }
}
