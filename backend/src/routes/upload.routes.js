import { Router } from 'express';
import UploadController from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

// Avatar upload (single file)
router.post('/avatar', upload.single('avatar'), UploadController.uploadAvatar);

// Business logo/banner upload (single file)
router.post('/business-asset', upload.single('file'), UploadController.uploadBusinessAsset);

// Product images upload (multiple files up to 5)
router.post('/products', upload.array('images', 5), UploadController.uploadProductImages);

export default router;

