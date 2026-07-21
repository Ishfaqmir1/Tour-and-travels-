import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return this.generateAuthResponse(user);
  }

  async login(email: string, password: string) {
    const superAdminEmail = this.configService.get<string>(
      'SUPER_ADMIN_EMAIL',
      'admin@viceroytravels.com',
    );
    const superAdminPassword = this.configService.get<string>(
      'SUPER_ADMIN_PASSWORD',
      'viceroy-admin-2026',
    );

    // Super admin login
    if (email.toLowerCase() === superAdminEmail?.toLowerCase()) {
      const existing = await this.prisma.user.findUnique({ where: { email } });

      if (existing) {
        // Use bcrypt compare against database password (supports seeded password 'password123')
        const isPasswordValid = await bcrypt.compare(password, existing.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
        return this.generateAuthResponse(existing);
      }

      // Admin doesn't exist in DB yet — fall back to env var for first login
      if (password !== superAdminPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const hashedPwd = await bcrypt.hash(password, 10);
      const admin = await this.prisma.user.create({
        data: {
          name: this.configService.get<string>('SUPER_ADMIN_NAME', 'THE VICEROY TOUR & TRAVELS Super Admin'),
          email,
          password: hashedPwd,
        },
      });
      return this.generateAuthResponse(admin);
    }

    // Regular user login
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhotoPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateProfile(
    userId: number,
    data: { name: string; email: string; phone?: string; address?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhotoPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  private generateAuthResponse(user: any) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const adminEmail = this.configService.get<string>(
      'SUPER_ADMIN_EMAIL',
      'admin@viceroytravels.com',
    );
    const isSuperAdmin =
      !!user.isSuperAdmin || !!user.is_super_admin || user.email?.toLowerCase() === adminEmail?.toLowerCase();

    return {
      status: 'success',
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        profile_photo_url: user.profilePhotoPath
          ? `/storage/${user.profilePhotoPath}`
          : null,
        is_super_admin: isSuperAdmin,
      },
      authorisation: {
        token,
        type: 'bearer',
      },
    };
  }
}
