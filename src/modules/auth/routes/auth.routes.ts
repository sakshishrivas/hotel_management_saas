import { Router } from 'express';

import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  logoutAllDevicesController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerificationEmailController,
  resetPasswordController,
  verifyEmailController,
} from '../controllers/auth.controller';
import {
  changePasswordSchema,
  emptyBodySchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authRateLimitMiddleware } from '../../../middleware/rate-limit.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', authRateLimitMiddleware, validateMiddleware({ body: registerSchema }), asyncHandler(registerController));
authRouter.post('/login', authRateLimitMiddleware, validateMiddleware({ body: loginSchema }), asyncHandler(loginController));
authRouter.post('/refresh', authRateLimitMiddleware, validateMiddleware({ body: refreshTokenSchema }), asyncHandler(refreshTokenController));
authRouter.post('/logout', authMiddleware, validateMiddleware({ body: emptyBodySchema }), asyncHandler(logoutController));
authRouter.post('/logout-all', authMiddleware, validateMiddleware({ body: emptyBodySchema }), asyncHandler(logoutAllDevicesController));
authRouter.post(
  '/forgot-password',
  authRateLimitMiddleware,
  validateMiddleware({ body: forgotPasswordSchema }),
  asyncHandler(forgotPasswordController),
);
authRouter.post('/reset-password', authRateLimitMiddleware, validateMiddleware({ body: resetPasswordSchema }), asyncHandler(resetPasswordController));
authRouter.post('/change-password', authMiddleware, validateMiddleware({ body: changePasswordSchema }), asyncHandler(changePasswordController));
authRouter.post('/email-verification/verify', authRateLimitMiddleware, validateMiddleware({ body: verifyEmailSchema }), asyncHandler(verifyEmailController));
authRouter.post(
  '/email-verification/resend',
  authMiddleware,
  validateMiddleware({ body: emptyBodySchema }),
  asyncHandler(resendVerificationEmailController),
);
