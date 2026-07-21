import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateBlogDto, UpdateBlogDto } from './dto/create-blog.dto';

@Controller('api/blog')
export class BlogController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: { page?: string; limit?: string; tag?: string; published?: string }) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '12', 10), 50);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.published !== 'false') where.isPublished = true;
    if (query.tag) where.tags = { contains: query.tag, mode: 'insensitive' as const };

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where, orderBy: { publishedAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      status: 'success',
      data: posts.map((p) => ({
        ...p,
        tags: p.tags ? JSON.parse(p.tags) : [],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return { status: 'error', message: 'Post not found' };
    return { status: 'success', data: { ...post, tags: post.tags ? JSON.parse(post.tags) : [] } };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() body: CreateBlogDto) {
    const post = await this.prisma.blogPost.create({
      data: {
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        image: body.image,
        author: body.author,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        isPublished: body.is_published || false,
        publishedAt: body.is_published ? new Date() : null,
        metaTitle: body.meta_title,
        metaDescription: body.meta_description,
      },
    });
    return { status: 'success', data: post };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBlogDto) {
    const data: any = {};
    if (body.title) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.excerpt !== undefined) data.excerpt = body.excerpt;
    if (body.image !== undefined) data.image = body.image;
    if (body.author !== undefined) data.author = body.author;
    if (body.tags) data.tags = JSON.stringify(body.tags);
    if (body.meta_title) data.metaTitle = body.meta_title;
    if (body.meta_description) data.metaDescription = body.meta_description;
    if (body.is_published !== undefined) {
      data.isPublished = body.is_published;
      if (body.is_published) data.publishedAt = new Date();
    }

    const post = await this.prisma.blogPost.update({ where: { id }, data });
    return { status: 'success', data: post };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { status: 'success', message: 'Post deleted' };
  }
}
