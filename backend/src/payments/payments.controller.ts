import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/payments')
export class PaymentsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const payments = await this.prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { id: 'desc' },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            location: true,
            hireCost: true,
            phone: true,
            email: true,
            photo: true,
          },
        },
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
        paid_at: p.paidAt.toISOString(),
        guide: p.guide
          ? {
              id: p.guide.id,
              name: p.guide.name,
              location: p.guide.location,
              hire_cost: p.guide.hireCost ? Number(p.guide.hireCost) : null,
              phone: p.guide.phone,
              email: p.guide.email,
              photo: p.guide.photo,
            }
          : null,
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: any,
    @Body()
    body: {
      guide_id: number;
      days: number;
      name_on_card: string;
      card_number: string;
      expiry: string;
      cvv: string;
    },
  ) {
    const guide = await this.prisma.tourGuide.findUnique({
      where: { id: body.guide_id },
    });

    if (!guide) {
      return { status: 'error', message: 'Tour guide not found' };
    }

    const days = body.days;
    const hireCostPerDay = Number(guide.hireCost) || 0;
    const amount = Math.round(hireCostPerDay * days * 100) / 100;
    const cardNumber = body.card_number.replace(/\D/g, '');
    const transactionId = 'TW-' + Math.random().toString(36).substring(2, 14).toUpperCase();
    const cardBrand = this.detectCardBrand(cardNumber);

    const payment = await this.prisma.payment.create({
      data: {
        userId: req.user.id,
        tourGuideId: guide.id,
        transactionId,
        amount,
        currency: 'USD',
        days,
        cardHolderName: body.name_on_card,
        cardBrand,
        cardLastFour: cardNumber.slice(-4),
        status: 'completed',
        paidAt: new Date(),
      },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            location: true,
            hireCost: true,
            phone: true,
            email: true,
            photo: true,
          },
        },
      },
    });

    return {
      status: 'success',
      message: 'Payment completed successfully.',
      data: {
        id: payment.id,
        transaction_id: payment.transactionId,
        amount: Number(payment.amount),
        currency: payment.currency,
        days: payment.days,
        status: payment.status,
        paid_at: payment.paidAt.toISOString(),
        guide: payment.guide
          ? {
              id: payment.guide.id,
              name: payment.guide.name,
              location: payment.guide.location,
              hire_cost: payment.guide.hireCost ? Number(payment.guide.hireCost) : null,
              phone: payment.guide.phone,
              email: payment.guide.email,
              photo: payment.guide.photo,
            }
          : null,
      },
    };
  }

  private detectCardBrand(cardNumber: string): string {
    if (/^4/.test(cardNumber)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return 'Mastercard';
    if (/^3[47]/.test(cardNumber)) return 'Amex';
    if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
    return 'Unknown';
  }
}
