import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const superAdminEmail = this.configService.get<string>(
      'SUPER_ADMIN_EMAIL',
      'admin@viceroytravels.com',
    );

    if (!superAdminEmail) {
      throw new ForbiddenException('Access denied');
    }

    const isSuperAdmin = user.email?.toLowerCase() === superAdminEmail.toLowerCase();

    if (!isSuperAdmin) {
      throw new ForbiddenException('Access denied. Admin only.');
    }

    return true;
  }
}
