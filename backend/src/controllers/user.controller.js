import UserService from '../services/user.service.js';
import ApiResponse from '../utils/apiResponse.js';

export class UserController {
  static async getUsers(req, res, next) {
    try {
      const result = await UserService.getUsers(req.query);
      return ApiResponse.success(res, 'Users retrieved successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return ApiResponse.success(res, 'User details retrieved', { user });
    } catch (error) {
      return next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const user = await UserService.updateUserStatus(req.params.id, req.body);
      return ApiResponse.success(res, 'User status updated', { user });
    } catch (error) {
      return next(error);
    }
  }
}

export default UserController;

