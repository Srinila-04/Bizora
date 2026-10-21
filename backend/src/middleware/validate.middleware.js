import { validationResult } from 'express-validator';

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the specified fields.',
      error: {
        code: 'VALIDATION_ERROR',
        details: formattedDetails
      }
    });
  };
};

export default validateRequest;

