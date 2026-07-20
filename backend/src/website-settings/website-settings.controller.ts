import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/website-settings')
export class WebsiteSettingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { group?: string }) {
    const where: any = {};
    if (query.group) where.group = query.group;

    const settings = await this.prisma.websiteSetting.findMany({ where, orderBy: [{ group: 'asc' }, { key: 'asc' }] });
    return { status: 'success', data: settings };
  }

  @Get('public')
  async getPublic() {
    // Returns all settings as a flat key-value map for frontend consumption
    const settings = await this.prisma.websiteSetting.findMany();
    const map: Record<string, any> = {};
    for (const s of settings) {
      if (s.type === 'json') {
        try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; }
      } else if (s.type === 'image') {
        map[s.key] = s.value;
      } else {
        map[s.key] = s.value;
      }
    }
    return { status: 'success', data: map };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const setting = await this.prisma.websiteSetting.findUnique({ where: { id } });
    if (!setting) return { status: 'error', message: 'Setting not found' };
    return { status: 'success', data: setting };
  }

  @Get('key/:key')
  async findByKey(@Param('key') key: string) {
    const setting = await this.prisma.websiteSetting.findUnique({ where: { key } });
    if (!setting) return { status: 'error', message: 'Setting not found' };
    let value: any = setting.value;
    if (setting.type === 'json') { try { value = JSON.parse(value); } catch {} }
    return { status: 'success', data: { ...setting, parsedValue: value } };
  }

  @Post()
  async create(@Body() body: any) {
    const setting = await this.prisma.websiteSetting.create({
      data: {
        key: body.key,
        value: typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value),
        type: body.type || 'text',
        group: body.group || 'general',
        label: body.label || body.key,
      },
    });
    return { status: 'success', data: setting };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data: any = {};
    if (body.value !== undefined) data.value = typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value);
    if (body.type) data.type = body.type;
    if (body.group) data.group = body.group;
    if (body.label) data.label = body.label;

    const setting = await this.prisma.websiteSetting.update({ where: { id }, data });
    return { status: 'success', data: setting };
  }

  @Put('key/:key')
  async updateByKey(@Param('key') key: string, @Body() body: any) {
    const data: any = {};
    if (body.value !== undefined) data.value = typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value);

    const setting = await this.prisma.websiteSetting.upsert({
      where: { key },
      update: data,
      create: { key, value: String(body.value || ''), type: body.type || 'text', group: body.group || 'general' },
    });
    return { status: 'success', data: setting };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.websiteSetting.delete({ where: { id } });
    return { status: 'success', message: 'Setting deleted' };
  }
}
