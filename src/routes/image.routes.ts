import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { imageController } from '../controllers/image.controller';

const router = Router();

router.post('/', upload.single('image'), imageController.uploadImage);
router.get('/', imageController.getImages);
router.get('/:id', imageController.getImageById);
router.delete('/:id', imageController.deleteImage);

export default router;
