import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';

@Controller('api/roles')
export class RolesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { users: true } } },
    });
    return {
      status: 'success',
      data: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions ? JSON.parse(r.permissions) : [],
        is_system: r.isSystem,
        user_count: r._count.users,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    if (!role) return { status: 'error', message: 'Role not found' };
    return {
      status: 'success',
      data: {
        ...role,
        permissions: role.permissions ? JSON.parse(role.permissions) : [],
        users: role.users.map((u) => u.user),
      },
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        name: body.name,
        description: body.description,
        permissions: body.permissions ? JSON.stringify(body.permissions) : null,
      },
    });
    return { status: 'success', data: role };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        permissions: body.permissions ? JSON.stringify(body.permissions) : null,
      },
    });
    return { status: 'success', data: role };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.role.delete({ where: { id } });
    return { status: 'success', message: 'Role deleted successfully' };
  }
}
