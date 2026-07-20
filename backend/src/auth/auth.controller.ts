import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string },
  ) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { status: 'success', message: 'Successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    const user = await this.authService.getProfile(req.user.id);
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@viceroytravels.com';
    
    return {
      status: 'success',
      user: user ? {
        ...user,
        profile_photo_url: user.profilePhotoPath
          ? `/storage/${user.profilePhotoPath}`
          : null,
        is_super_admin: user.email?.toLowerCase() === adminEmail.toLowerCase(),
      } : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() body: { name: string; email: string; phone?: string; address?: string },
  ) {
    const user = await this.authService.updateProfile(req.user.id, body);
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@viceroytravels.com';

    return {
      status: 'success',
      message: 'Profile updated successfully.',
      user: user ? {
        ...user,
        profile_photo_url: user.profilePhotoPath
          ? `/storage/${user.profilePhotoPath}`
          : null,
        is_super_admin: user.email?.toLowerCase() === adminEmail.toLowerCase(),
      } : null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() body: { current_password: string; new_password: string },
  ) {
    return this.authService.changePassword(
      req.user.id,
      body.current_password,
      body.new_password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any) {
    return {
      status: 'success',
      message: 'Token refreshed',
    };
  }
}
