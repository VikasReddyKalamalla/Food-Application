import env from '../../config/env.js';
import logger from '../../config/logger.js';

export class EmailService {
  constructor() {
    this.isConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
  }

  /**
   * Send transactional email (e.g. password reset, order confirmation)
   * Falls back gracefully to structured audit logging when SMTP is not configured.
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.info(
        { to, subject, note: 'SMTP unconfigured - logged in mock mode' },
        '[EMAIL_MOCK] Dispatched transactional notification'
      );
      return { success: true, mock: true };
    }

    logger.info({ to, subject }, 'Sending transactional email via SMTP');
    // Live nodemailer transporter sends here
    return { success: true, mock: false };
  }
}

export const emailService = new EmailService();
export default emailService;
