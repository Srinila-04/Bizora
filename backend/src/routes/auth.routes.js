import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { authLimiter, userMeLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerValidator,
  customerRegisterValidator,
  merchantRegisterValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator
} from '../validators/auth.validator.js';

const router = Router();

// Public auth endpoints
router.post('/register', authLimiter, validateRequest(registerValidator), AuthController.register);
router.post('/register/customer', authLimiter, validateRequest(customerRegisterValidator), AuthController.registerCustomer);
router.post('/register/merchant', authLimiter, validateRequest(merchantRegisterValidator), AuthController.registerMerchant);
router.post('/login', authLimiter, validateRequest(loginValidator), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordValidator), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordValidator), AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, AuthController.resendVerification);

// Protected auth endpoints
router.use(authenticate);
router.get('/me', userMeLimiter, AuthController.getMe);
router.patch('/me', validateRequest(updateProfileValidator), AuthController.updateMe);
router.patch('/change-password', validateRequest(changePasswordValidator), AuthController.changePassword);
router.post('/logout-all', AuthController.logoutAll);

export default router;

