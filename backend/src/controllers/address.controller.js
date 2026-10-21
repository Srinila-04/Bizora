import AddressService from '../services/address.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class AddressController {
  static async getAddresses(req, res, next) {
    try {
      const addresses = await AddressService.getAddresses(req.user.id);
      return ApiResponse.success(res, 'Addresses retrieved successfully', { addresses });
    } catch (error) {
      return next(error);
    }
  }

  static async getAddressById(req, res, next) {
    try {
      const address = await AddressService.getAddressById(req.user.id, req.params.id);
      return ApiResponse.success(res, 'Address retrieved successfully', { address });
    } catch (error) {
      return next(error);
    }
  }

  static async createAddress(req, res, next) {
    try {
      const address = await AddressService.createAddress(req.user.id, req.body);
      return ApiResponse.created(res, 'Address created successfully', { address });
    } catch (error) {
      return next(error);
    }
  }

  static async updateAddress(req, res, next) {
    try {
      const address = await AddressService.updateAddress(req.user.id, req.params.id, req.body);
      return ApiResponse.success(res, 'Address updated successfully', { address });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteAddress(req, res, next) {
    try {
      const result = await AddressService.deleteAddress(req.user.id, req.params.id);
      return ApiResponse.success(res, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async setDefaultAddress(req, res, next) {
    try {
      const address = await AddressService.setDefaultAddress(req.user.id, req.params.id);
      return ApiResponse.success(res, 'Default address updated successfully', { address });
    } catch (error) {
      return next(error);
    }
  }
}

export default AddressController;

