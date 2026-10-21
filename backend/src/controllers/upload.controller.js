import path from 'path';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { Business, Product, User } from '../database/models/index.js';
import { deleteUploadedFile, verifyImageMagicBytes } from '../middleware/upload.middleware.js';
import { ROLES } from '../constants/roles.js';

export class UploadController {
  static async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No image file uploaded');
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const user = await User.findByPk(req.user.id);

      // Clean old avatar if existed
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(user.avatar));
      }

      user.avatar = fileUrl;
      await user.save();

      return ApiResponse.success(res, 'Avatar uploaded successfully', {
        avatarUrl: fileUrl,
        filename: req.file.filename
      });
    } catch (error) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return next(error);
    }
  }

  static async uploadBusinessAsset(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No image file uploaded');
      }

      const { businessId, assetType } = req.body; // assetType: 'logo' or 'banner'
      if (!['logo', 'banner'].includes(assetType)) {
        throw ApiError.badRequest("assetType must be 'logo' or 'banner'");
      }

      const business = await Business.findByPk(businessId);
      if (!business) {
        throw ApiError.notFound('Business not found');
      }

      if (req.user.role !== ROLES.ADMIN && business.ownerId !== req.user.id) {
        throw ApiError.forbidden('You do not have permission to upload assets for this business');
      }

      // Verify file binary magic bytes to guarantee it is a valid image
      if (!verifyImageMagicBytes(req.file.path)) {
        deleteUploadedFile(req.file.filename);
        throw ApiError.badRequest('Invalid or corrupted image file. Allowed formats: JPG, PNG, WebP, GIF.');
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      // Clean old file
      const oldAsset = assetType === 'logo' ? business.logo : business.banner;
      if (oldAsset && oldAsset.startsWith('/uploads/')) {
        deleteUploadedFile(path.basename(oldAsset));
      }

      if (assetType === 'logo') {
        business.logo = fileUrl;
      } else {
        business.banner = fileUrl;
      }
      await business.save();

      return ApiResponse.success(res, `Business ${assetType} uploaded successfully`, {
        url: fileUrl,
        filename: req.file.filename,
        business
      });
    } catch (error) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return next(error);
    }
  }

  static async uploadProductImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('No image files uploaded');
      }

      const { productId } = req.body;
      const uploadedUrls = req.files.map((f) => `/uploads/${f.filename}`);

      if (productId) {
        const product = await Product.findByPk(productId, {
          include: [{ model: Business, as: 'business' }]
        });

        if (!product) {
          throw ApiError.notFound('Product not found');
        }

        if (req.user.role !== ROLES.ADMIN && product.business.ownerId !== req.user.id) {
          throw ApiError.forbidden('You do not have permission to upload images for this product');
        }

        const existingImages = Array.isArray(product.images) ? product.images : [];
        product.images = [...existingImages, ...uploadedUrls];
        await product.save();
      }

      return ApiResponse.success(res, 'Product images uploaded successfully', {
        images: uploadedUrls
      });
    } catch (error) {
      if (req.files) {
        req.files.forEach((f) => deleteUploadedFile(f.filename));
      }
      return next(error);
    }
  }
}

export default UploadController;

