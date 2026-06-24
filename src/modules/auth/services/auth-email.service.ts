import { logger } from '../../../logger/winston';
import { env } from '../../../config/env';

export class AuthEmailService {
  async sendVerificationEmail(email: string, displayName: string, token: string) {
    const verificationUrl = `${env.APP_BASE_URL}/verify-email?token=${token}`;
    logger.info(
      {
        email,
        displayName,
        verificationUrl,
      },
      'Email verification notification queued',
    );
  }

  async sendPasswordResetEmail(email: string, displayName: string, token: string) {
    const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${token}`;
    logger.info(
      {
        email,
        displayName,
        resetUrl,
      },
      'Password reset notification queued',
    );
  }
}
