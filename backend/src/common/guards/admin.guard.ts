import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // Use the database isSuperAdmin field (set via admin.seed or admin panel)
    const isSuperAdmin = !!user.isSuperAdmin || !!user.is_super_admin;

    if (!isSuperAdmin) {
      throw new ForbiddenException('Access denied. Admin only.');
    }

    return true;
  }
}
