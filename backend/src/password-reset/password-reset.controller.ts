import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Controller('api')
export class PasswordResetController {
  constructor(private prisma: PrismaService) {}

  @Post('forgot-password')
  async sendCode(@Body() body: { email: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });

    // Generic response to avoid leaking whether an email exists
    if (!user) {
      return {
        status: 'success',
        message: 'If an account exists for this email, a reset code has been sent.',
      };
    }

    // Generate a 6-digit code
    const code = crypto.randomBytes(3).toString('hex');
    const hashedCode = await bcrypt.hash(code, 10);

    // Store the reset token
    await this.prisma.passwordReset.upsert({
      where: { email_token: { email: body.email, token: hashedCode } },
      update: { token: hashedCode, createdAt: new Date() },
      create: { email: body.email, token: hashedCode },
    });

    // In production, send email here
    console.log(`Password reset code for ${body.email}: ${code}`);

    return {
      status: 'success',
      message: 'If an account exists for this email, a reset code has been sent.',
    };
  }

  @Post('reset-password')
  async reset(
    @Body()
    body: {
      email: string;
      code: string;
      password: string;
      password_confirmation: string;
    },
  ) {
    if (body.password !== body.password_confirmation) {
      return {
        status: 'error',
        message: 'Passwords do not match.',
        errors: { password: ['Passwords do not match.'] },
      };
    }

    // Find valid reset tokens for this email
    const resetRecords = await this.prisma.passwordReset.findMany({
      where: { email: body.email },
      orderBy: { createdAt: 'desc' },
    });

    let validToken = false;
    for (const record of resetRecords) {
      const isMatch = await bcrypt.compare(body.code.toLowerCase(), record.token);
      if (isMatch) {
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      return {
        status: 'error',
        message: 'Invalid or expired reset code.',
        errors: { code: ['Invalid or expired reset code. Use the latest code from your newest email.'] },
      };
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    await this.prisma.user.update({
      where: { email: body.email },
      data: { password: hashedPassword },
    });

    // Clean up used reset codes
    await this.prisma.passwordReset.deleteMany({
      where: { email: body.email },
    });

    return {
      status: 'success',
      message: 'Password reset successful. You can now log in.',
    };
  }
}
