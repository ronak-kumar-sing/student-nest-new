import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * GET /upload/signature?folder=student-nest/listings
   * Returns a Cloudinary signed upload signature for direct browser uploads.
   * The frontend uses this to upload images directly to Cloudinary.
   */
  @Post('signature')
  @HttpCode(HttpStatus.OK)
  getUploadSignature(@Query('folder') folder?: string) {
    return this.uploadService.generateUploadSignature(folder);
  }

  /**
   * DELETE /upload/:publicId
   * Deletes a Cloudinary asset (used when owner removes a photo).
   */
  @Delete('*publicId')
  deleteAsset(
    @Param('publicId') publicIdParam?: string,
    @Query('publicId') publicIdQuery?: string,
  ) {
    const publicId = publicIdParam || publicIdQuery || '';
    return this.uploadService.deleteAsset(publicId);
  }
}
