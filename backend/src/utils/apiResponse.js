export class ApiResponse {
  static success(res, message = 'Operation completed successfully', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, message = 'Resource created successfully', data = {}) {
    return this.success(res, message, data, 201);
  }
}

export default ApiResponse;

