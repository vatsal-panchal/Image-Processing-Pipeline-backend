import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Image, IImage } from '../models/Image';
import { AppError } from '../middleware/error.middleware';

const processedDir = path.join(process.cwd(), 'uploads', 'processed');
const thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

const removeFileSafely = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (err) {}
};

export class ImageService {
  async processAndSaveImage(file: Express.Multer.File): Promise<IImage> {
    const originalRelativePath = path.join('uploads', 'originals', file.filename).replace(/\\/g, '/');
    const processedFileName = `processed-${file.filename}`;
    const thumbnailFileName = `thumb-${file.filename}`;

    const processedAbsolutePath = path.join(processedDir, processedFileName);
    const thumbnailAbsolutePath = path.join(thumbnailDir, thumbnailFileName);

    const processedRelativePath = path.join('uploads', 'processed', processedFileName).replace(/\\/g, '/');
    const thumbnailRelativePath = path.join('uploads', 'thumbnails', thumbnailFileName).replace(/\\/g, '/');

    const imageRecord = new Image({
      originalName: file.originalname,
      originalPath: originalRelativePath,
      processedPath: '',
      thumbnailPath: '',
      mimeType: file.mimetype,
      originalSize: file.size,
      processedSize: 0,
      width: 0,
      height: 0,
      status: 'PROCESSING'
    });

    await imageRecord.save();

    try {
      const metadata = await sharp(file.path).metadata();

      if (!metadata.width || !metadata.height) {
        throw new AppError('Unable to read image dimensions', 400);
      }

      let processedPipeline = sharp(file.path).resize({
        width: 1200,
        withoutEnlargement: true
      });

      let thumbnailPipeline = sharp(file.path).resize({
        width: 300,
        withoutEnlargement: true
      });

      const format = metadata.format;
      if (format === 'jpeg' || format === 'jpg') {
        processedPipeline = processedPipeline.jpeg({ quality: 80 });
        thumbnailPipeline = thumbnailPipeline.jpeg({ quality: 80 });
      } else if (format === 'png') {
        processedPipeline = processedPipeline.png({ quality: 80, compressionLevel: 8 });
        thumbnailPipeline = thumbnailPipeline.png({ quality: 80, compressionLevel: 8 });
      } else if (format === 'webp') {
        processedPipeline = processedPipeline.webp({ quality: 80 });
        thumbnailPipeline = thumbnailPipeline.webp({ quality: 80 });
      }

      await processedPipeline.toFile(processedAbsolutePath);
      await thumbnailPipeline.toFile(thumbnailAbsolutePath);

      const processedStats = await fs.promises.stat(processedAbsolutePath);
      const processedMeta = await sharp(processedAbsolutePath).metadata();

      imageRecord.processedPath = processedRelativePath;
      imageRecord.thumbnailPath = thumbnailRelativePath;
      imageRecord.processedSize = processedStats.size;
      imageRecord.width = processedMeta.width || metadata.width;
      imageRecord.height = processedMeta.height || metadata.height;
      imageRecord.status = 'COMPLETED';

      await imageRecord.save();
      return imageRecord;
    } catch (error: any) {
      imageRecord.status = 'FAILED';
      await imageRecord.save();
      await removeFileSafely(processedAbsolutePath);
      await removeFileSafely(thumbnailAbsolutePath);
      throw error;
    }
  }

  async getAllImages(page: number, limit: number) {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [images, total] = await Promise.all([
      Image.find().sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Image.countDocuments()
    ]);

    return {
      images,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    };
  }

  async getImageById(id: string): Promise<IImage> {
    const image = await Image.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }
    return image;
  }

  async deleteImage(id: string): Promise<void> {
    const image = await Image.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    if (image.originalPath) {
      await removeFileSafely(image.originalPath);
    }
    if (image.processedPath) {
      await removeFileSafely(image.processedPath);
    }
    if (image.thumbnailPath) {
      await removeFileSafely(image.thumbnailPath);
    }

    await Image.findByIdAndDelete(id);
  }
}

export const imageService = new ImageService();
