import { Request, Response, NextFunction } from 'express';
import { imageService } from '../services/image.service';
import { AppError } from '../middleware/error.middleware';

export class ImageController {
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No image file provided', 400);
      }

      const result = await imageService.processAndSaveImage(req.file);

      res.status(201).json({
        success: true,
        message: 'Image processed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await imageService.getAllImages(page, limit);

      res.status(200).json({
        success: true,
        message: 'Images retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getImageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await imageService.getImageById(id);

      res.status(200).json({
        success: true,
        message: 'Image retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await imageService.deleteImage(id);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

export const imageController = new ImageController();
