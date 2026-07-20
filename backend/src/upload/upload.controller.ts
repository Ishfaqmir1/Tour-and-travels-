import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

function sanitizeFilename(original: string): string {
  // Keep only alphanumeric, dots, hyphens, underscores
  const ext = extname(original);
  const name = original.replace(ext, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  return `${name}-${timestamp}${ext}`;
}

@Controller('api/upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, sanitizeFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed'), false);
        }
        cb(null, true);
      },

      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      status: 'success',
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, sanitizeFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Only video files (mp4, webm, ogg, mov) are allowed'), false);
        }
        cb(null, true);
      },

      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
    }),
  )
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      status: 'success',
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, sanitizeFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new Error('Invalid file type'), false);
        }
        cb(null, true);
      },

      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    return {
      status: 'success',
      files: files.map((f) => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
      })),
    };
  }
}
