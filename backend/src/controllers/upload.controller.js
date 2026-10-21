import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import { Business, Product, User } from '../database/models/index.js';
import { ROLES } from '../constants/roles.js';
import cloudinary from '../config/cloudinary.js';

// Helper to safely delete an uploaded asset from Cloudinary on error
const deleteCloudinaryFile = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Ignore cleanup errors
  }
};

export class UploadController {
  /**
   * Upload User Avatar
   */
  static async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No image file uploaded');
      }

      // Cloudinary returns the full HTTPS URL in req.file.path
      const fileUrl = req.file.path;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      user.avatar = fileUrl;
      await user.save();

      return ApiResponse.success(res, 'Avatar uploaded successfully', {
        avatarUrl: fileUrl,
        filename: req.file.filename // Cloudinary public_id
      });
    } catch (error) {
      if (req.file?.filename) {
        await deleteCloudinaryFile(req.file.filename);
      }
      return next(error);
    }
  }

  /**
   * Upload Business Logo or Banner
   */
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

      const fileUrl = req.file.path;

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
      if (req.file?.filename) {
        await deleteCloudinaryFile(req.file.filename);
      }
      return next(error);
    }
  }

  /**
   * Upload Product Images (Supports multiple images)
   */
  static async uploadProductImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('No image files uploaded');
      }

      const { productId } = req.body;
      const uploadedUrls = req.files.map((f) => f.path);

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
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          if (file.filename) {
            await deleteCloudinaryFile(file.filename);
          }
        }
      }
      return next(error);
    }
  }
}

export default UploadController;