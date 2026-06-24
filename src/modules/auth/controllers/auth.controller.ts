import type { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

function buildContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.header('user-agent'),
    requestId: req.requestId,
  };
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body, buildContext(req));

    sendSuccess(res, result, 'Registration successful', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body, buildContext(req));

    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.refreshToken(req.body, buildContext(req));

    sendSuccess(res, result, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.sub || !req.user.sid) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
          details: null,
        },
      });
      return;
    }

    await authService.logout(req.user.sub, req.user.sid, buildContext(req));

    sendSuccess(res, { loggedOut: true }, 'Logged out');
  } catch (error) {
    next(error);
  }
}

export async function logoutAllDevicesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.sub) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
          details: null,
        },
      });
      return;
    }

    await authService.logoutAllDevices(req.user.sub, buildContext(req));

    sendSuccess(res, { loggedOut: true }, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.forgotPassword(req.body, buildContext(req));

    sendSuccess(
      res,
      { submitted: true },
      'If the account exists, password reset instructions have been sent',
      HTTP_STATUS.ACCEPTED,
    );
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.resetPassword(req.body, buildContext(req));

    sendSuccess(res, { reset: true }, 'Password reset successful');
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.sub) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
          details: null,
        },
      });
      return;
    }

    await authService.changePassword(req.user.sub, req.body, buildContext(req));

    sendSuccess(
      res,
      { passwordChanged: true },
      'Password changed successfully',
    );
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.verifyEmail(req.body, buildContext(req));

    sendSuccess(res, { verified: true }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.sub) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required',
          details: null,
        },
      });
      return;
    }

    await authService.resendVerificationEmail(
      req.user.sub,
      buildContext(req),
    );

    sendSuccess(res, { queued: true }, 'Verification email resent');
  } catch (error) {
    next(error);
  }
}