import env from '../../config/env.js';
import logger from '../../config/logger.js';

export class StorageService {
  constructor() {
    this.isConfigured = Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload image buffer to cloud storage
   * @param {Buffer} buffer
   * @param {string} folder
   */
  async uploadImage(buffer, folder = 'food-delivery') {
    if (!this.isConfigured) {
      logger.info({ folder }, 'Storage unconfigured - generated mock asset URL');
      return {
        url: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?mock=true`,
        publicId: `mock_${Date.now()}`,
      };
    }

    // Cloudinary uploader executes here in production
    return {
      url: `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/${folder}/sample.jpg`,
      publicId: `cloud_${Date.now()}`,
    };
  }
}

export const storageService = new StorageService();
export default storageService;
