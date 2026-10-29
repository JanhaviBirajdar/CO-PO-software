// ============================================================
// Mail Service — Faculty Welcome & Credentials Email
// ============================================================

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export interface FacultyCredentialsEmailOptions {
  to: string;
  name: string;
  employeeId: string;
  password: string;
  designation?: string;
  departmentName?: string;
  loginUrl?: string;
}

export const MailService = {
  getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  },

  async sendFacultyWelcomeEmail(options: FacultyCredentialsEmailOptions): Promise<{
    success: boolean;
    simulated: boolean;
    messageId?: string;
    error?: string;
  }> {
    const {
      to,
      name,
      employeeId,
      password,
      designation = 'Faculty Member',
      departmentName = 'Academic Department',
      loginUrl = process.env.APP_URL ? `${process.env.APP_URL}/login` : 'http://localhost:5173/login',
    } = options;

    const fromAddress = process.env.SMTP_FROM || `"OBE Portal Admin" <${process.env.SMTP_USER || 'noreply@obe.edu'}>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to OBE Attainment System</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .card-row:last-child { border-bottom: none; }
        .card-label { font-weight: 600; color: #64748b; }
        .card-value { font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; }
        .highlight-value { color: #0284c7; font-size: 15px; }
        .btn-container { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3); }
        .instructions { background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OBE Attainment Management System</h1>
          <p>Institutional Outcome-Based Education & NBA Evaluation Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${name},</div>
          <div class="intro">
            Your faculty account has been registered on the <strong>Outcome-Based Education (OBE) Portal</strong>. You have been appointed with the designation of <strong>${designation}</strong> in the <strong>${departmentName}</strong>.
          </div>

          <div class="card">
            <div style="font-size: 12px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Your Login Credentials</div>
            <div class="card-row">
              <span class="card-label">Employee ID:</span>
              <span class="card-value highlight-value">${employeeId}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Registered Email:</span>
              <span class="card-value">${to}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Temporary Password:</span>
              <span class="card-value highlight-value" style="color: #dc2626;">${password}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Department:</span>
              <span class="card-value" style="font-family: inherit;">${departmentName}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Designation:</span>
              <span class="card-value" style="font-family: inherit;">${designation}</span>
            </div>
          </div>

          <div class="instructions">
            <strong>Important Security Note:</strong> You can sign in using either your <strong>Employee ID (${employeeId})</strong> or your <strong>Email (${to})</strong>. For security purposes, please log in and change your temporary password immediately upon your first login.
          </div>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Sign In to Faculty Portal &rarr;</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
            If the button above does not work, copy and paste this URL into your web browser:<br>
            <a href="${loginUrl}" style="color: #0284c7; word-break: break-all;">${loginUrl}</a>
          </p>
        </div>
        <div class="footer">
          This is an automated administrative notification. Please do not reply directly to this email.<br>
          &copy; ${new Date().getFullYear()} OBE Attainment Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
Welcome to OBE Attainment Management System
------------------------------------------
Dear ${name},

Your faculty account has been successfully created.
Designation: ${designation}
Department: ${departmentName}

YOUR LOGIN CREDENTIALS:
- Employee ID: ${employeeId}
- Email: ${to}
- Password: ${password}
- Login URL: ${loginUrl}

Note: You can log in using either your Employee ID or your Email Address. Please change your password upon first login.
`;

    const transporter = MailService.getTransporter();

    if (!transporter) {
      logger.info(`[SIMULATED EMAIL DISPATCH] SMTP credentials not set in .env.`);
      logger.info(`[EMAIL TO]: ${to}`);
      logger.info(`[CREDENTIALS]: EmployeeId=${employeeId} | Password=${password} | Name=${name}`);
      return {
        success: true,
        simulated: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `Welcome to OBE Portal: Your Faculty Credentials (${employeeId})`,
        text: textContent,
        html: htmlContent,
      });

      logger.info(`[EMAIL SENT] Successfully dispatched credentials email to ${to}. MessageId: ${info.messageId}`);
      return {
        success: true,
        simulated: false,
        messageId: info.messageId,
      };
    } catch (err: any) {
      logger.error(`[EMAIL ERROR] Failed to send email to ${to}: ${err.message}`);
      return {
        success: false,
        simulated: false,
        error: err.message,
      };
    }
  },
};

