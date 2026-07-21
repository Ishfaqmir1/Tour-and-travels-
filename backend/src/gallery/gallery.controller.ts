import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateGalleryAlbumDto, UpdateGalleryAlbumDto, CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery.dto';

@Controller('api/gallery')
export class GalleryController {
  constructor(private prisma: PrismaService) {}

  @Get('albums')
  async getAlbums() {
    const albums = await this.prisma.galleryAlbum.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
    return {
      status: 'success',
      data: albums.map((a) => ({
        id: a.id, title: a.title, description: a.description,
        cover_image: a.coverImage, slug: a.slug, item_count: a._count.items,
      })),
    };
  }

  @Get('items')
  async getItems(@Query() query: { album_id?: string; destination_id?: string; type?: string }) {
    const where: any = { isActive: true };
    if (query.album_id) where.albumId = parseInt(query.album_id, 10);
    if (query.destination_id) where.destinationId = parseInt(query.destination_id, 10);
    if (query.type) where.type = query.type;

    const items = await this.prisma.galleryItem.findMany({
      where, orderBy: { sortOrder: 'asc' },
      include: { album: { select: { id: true, title: true, slug: true } } },
    });

    return {
      status: 'success',
      data: items.map((i) => ({
        id: i.id, type: i.type, url: i.url, thumbnail_url: i.thumbnailUrl,
        title: i.title, description: i.description, album: i.album,
      })),
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('albums')
  async createAlbum(@Body() body: CreateGalleryAlbumDto) {
    const album = await this.prisma.galleryAlbum.create({
      data: {
        title: body.title,
        description: body.description,
        coverImage: body.cover_image,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
        sortOrder: body.sort_order || 0,
      },
    });
    return { status: 'success', data: album };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('items')
  async createItem(@Body() body: CreateGalleryItemDto) {
    const item = await this.prisma.galleryItem.create({
      data: {
        albumId: body.album_id ?? null,
        destinationId: body.destination_id ?? null,
        type: body.type || 'photo',
        url: body.url,
        thumbnailUrl: body.thumbnail_url,
        title: body.title,
        description: body.description,
        sortOrder: body.sort_order || 0,
      },
    });
    return { status: 'success', data: item };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('albums/:id')
  async updateAlbum(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateGalleryAlbumDto) {
    const album = await this.prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: body.title, description: body.description,
        coverImage: body.cover_image, slug: body.slug,
        sortOrder: body.sort_order, isActive: body.is_active,
      },
    });
    return { status: 'success', data: album };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('items/:id')
  async updateItem(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateGalleryItemDto) {
    const item = await this.prisma.galleryItem.update({
      where: { id },
      data: {
        albumId: body.album_id ?? null,
        type: body.type, url: body.url, thumbnailUrl: body.thumbnail_url,
        title: body.title, description: body.description,
        sortOrder: body.sort_order, isActive: body.is_active,
      },
    });
    return { status: 'success', data: item };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('albums/:id')
  async removeAlbum(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.galleryAlbum.delete({ where: { id } });
    return { status: 'success', message: 'Album deleted' };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('items/:id')
  async removeItem(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.galleryItem.delete({ where: { id } });
    return { status: 'success', message: 'Item deleted' };
  }
}
