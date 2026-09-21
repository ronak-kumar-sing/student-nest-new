import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME', 'demo'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY', 'demo_key'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET', 'demo_secret'),
      secure: true,
    });
  }

  /**
   * Generate a signed upload signature so the browser can upload
   * directly to Cloudinary without routing through our server.
   */
  generateUploadSignature(folder = 'student-nest/listings') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = this.config.get<string>('CLOUDINARY_UPLOAD_PRESET', 'student_nest_unsigned');

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
      upload_preset: uploadPreset,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.config.get<string>('CLOUDINARY_API_SECRET', 'demo_secret'),
    );

    return {
      signature,
      timestamp,
      apiKey: this.config.get<string>('CLOUDINARY_API_KEY', 'demo_key'),
      cloudName: this.config.get<string>('CLOUDINARY_CLOUD_NAME', 'demo'),
      uploadPreset,
      folder,
    };
  }

  /**
   * Delete a Cloudinary asset by its public_id
   */
  async deleteAsset(publicId: string): Promise<{ result: string }> {
    const result = await cloudinary.uploader.destroy(publicId);
    return { result: result.result };
  }
}
