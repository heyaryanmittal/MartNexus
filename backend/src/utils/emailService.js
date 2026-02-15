const nodemailer = require('nodemailer');
const prisma = require('./prismaClient');


class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  
  initializeTransporter() {
    try {
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false 
        }
      };

      
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;

      
      this.verifyConnection();

      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      this.isConfigured = false;
    }
  }

  
  async verifyConnection() {
    if (!this.isConfigured) return false;

    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      this.isConfigured = false;
      return false;
    }
  }

  
  async sendEmail({ to, subject, html, type = 'GENERAL', userId = null, shopId = null, metadata = null }) {
    
    const notificationLog = await prisma.notificationLog.create({
      data: {
        userId,
        shopId,
        type,
        recipient: to,
        subject,
        body: html,
        status: 'PENDING',
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    
    if (!this.isConfigured) {
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Email service not configured'
        }
      });

      console.warn(`⚠️  Email not sent (service not configured): ${subject} to ${to}`);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"MartNexus" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);

      
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`✅ Email sent successfully: ${subject} to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      
      await prisma.notificationLog.update({
        where: { id: notificationLog.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });

      console.error(`❌ Email sending failed: ${subject} to ${to}`, error.message);
      return { success: false, error: error.message };
    }
  }

  
  async sendLowStockAlert(userEmail, shopName, lowStockProducts) {
    const subject = `🔔 Low Stock Alert - ${shopName}`;

    const productRows = lowStockProducts.map(product => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${product.name}</td>
        <td style="padding: 12px; text-align: center;">${product.stock} ${product.quantityType}</td>
        <td style="padding: 12px; text-align: center;">${product.reorderLevel} ${product.quantityType}</td>
        <td style="padding: 12px; text-align: center;">
          <span style="background-color: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
            Low Stock
          </span>
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              🔔 Low Stock Alert
            </h1>
            <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 14px;">
              ${shopName}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              The following products in <strong>${shopName}</strong> have reached or fallen below their reorder levels. Please restock these items soon to avoid running out of stock.
            </p>

            <!-- Products Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; color: #1f2937; font-weight: 600; font-size: 14px;">Product Name</th>
                  <th style="padding: 12px; text-align: center; color: #1f2937; font-weight: 600; font-size: 14px;">Current Stock</th>
                  <th style="padding: 12px; text-align: center; color: #1f2937; font-weight: 600; font-size: 14px;">Reorder Level</th>
                  <th style="padding: 12px; text-align: center; color: #1f2937; font-weight: 600; font-size: 14px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>

            <!-- Summary -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px;">
                ⚠️ Total Low Stock Items: ${lowStockProducts.length}
              </p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/inventory" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Inventory
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              This is an automated alert from MartNexus. Please take necessary action to restock these items.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} MartNexus. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      type: 'LOW_STOCK_ALERT',
      metadata: {
        shopName,
        lowStockCount: lowStockProducts.length,
        products: lowStockProducts.map(p => ({ name: p.name, stock: p.stock }))
      }
    });
  }

  
  async sendBackupSuccessEmail(userEmail, backupInfo) {
    const subject = '✅ Backup Completed Successfully - MartNexus';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              ✅ Backup Completed
            </h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">
              Your data is safe and secure
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Your ${backupInfo.isAutomatic ? 'automatic weekly' : 'manual'} backup has been completed successfully.
            </p>

            <!-- Backup Details -->
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">Backup Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">File Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${backupInfo.fileName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">File Size:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${(backupInfo.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Backup Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${backupInfo.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Created At:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(backupInfo.createdAt).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Backup Mode:</td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="background-color: ${backupInfo.isAutomatic ? '#dbeafe' : '#f3f4f6'}; color: ${backupInfo.isAutomatic ? '#1e40af' : '#374151'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      ${backupInfo.isAutomatic ? 'Automatic' : 'Manual'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/backup-export" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Backup History
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              ${backupInfo.isAutomatic ? 'This is an automatic weekly backup. Your data is backed up every Sunday at 2:00 AM.' : 'This backup was created manually. You can download it from the Backup & Export page.'}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} MartNexus. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      type: 'BACKUP_SUCCESS',
      metadata: backupInfo
    });
  }

  
  async sendBackupFailureEmail(userEmail, errorInfo) {
    const subject = '❌ Backup Failed - MartNexus';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              ❌ Backup Failed
            </h1>
            <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 14px;">
              Action required
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Your ${errorInfo.isAutomatic ? 'automatic weekly' : 'manual'} backup encountered an error and could not be completed.
            </p>

            <!-- Error Details -->
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">Error Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Error Message:</td>
                  <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-weight: 600; text-align: right;">${errorInfo.error}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Failed At:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date().toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Backup Type:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${errorInfo.type || 'FULL_DATABASE'}</td>
                </tr>
              </table>
            </div>

            <!-- Recommendations -->
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Recommended Actions:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                <li>Try creating a manual backup from the dashboard</li>
                <li>Check your internet connection</li>
                <li>Ensure sufficient storage space</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/backup-export" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Try Manual Backup
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If you continue to experience issues, please contact our support team for assistance.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} MartNexus. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      type: 'BACKUP_FAILURE',
      metadata: errorInfo
    });
  }

  
  async sendOTPEmail(userEmail, otp) {
    const subject = 'Verify Your Email - MartNexus';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              Email Verification
            </h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 14px;">
              MartNexus
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for registering with MartNexus. Please use the following OTP to verify your email address:
            </p>

            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #3b82f6; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Your OTP Code
              </p>
              <p style="color: #1e3a8a; font-size: 42px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                This code will expire in 10 minutes
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} MartNexus. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      type: 'OTP_VERIFICATION',
      metadata: { otpLength: otp.length }
    });
  }

  
  async sendPasswordChangeEmail(userEmail, userName, changeDetails = {}) {
    const subject = '🔐 Password Changed Successfully - MartNexus';
    const changeTime = new Date().toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 48px;">🔐</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Password Changed Successfully
            </h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">
              Your account security has been updated
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${userName || 'User'}</strong>,
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              This email confirms that your password for your MartNexus account was successfully changed.
            </p>

            <!-- Success Banner -->
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <div style="display: flex; align-items: center;">
                <span style="font-size: 32px; margin-right: 15px;">✅</span>
                <div>
                  <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
                    Password Update Confirmed
                  </h3>
                  <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.5;">
                    Your password has been securely updated and is now active.
                  </p>
                </div>
              </div>
            </div>

            <!-- Change Details -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📋 Change Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">
                    <strong>Account Email:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 500;">
                    ${userEmail}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                    <strong>Changed On:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 500; border-top: 1px solid #e5e7eb;">
                    ${changeTime}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                    <strong>IP Address:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 500; border-top: 1px solid #e5e7eb;">
                    ${changeDetails.ipAddress || 'Not available'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                    <strong>Device:</strong>
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-weight: 500; border-top: 1px solid #e5e7eb;">
                    ${changeDetails.userAgent || 'Not available'}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Security Alert -->
            <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                <div>
                  <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                    Didn't make this change?
                  </h4>
                  <p style="color: #78350f; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                    If you did not change your password, your account may be compromised. Please take immediate action:
                  </p>
                  <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                    <li>Reset your password immediately</li>
                    <li>Review your recent account activity</li>
                    <li>Contact our support team</li>
                    <li>Enable two-factor authentication if available</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Security Tips -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                🛡️ Security Tips
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                <li>Use a strong, unique password for your account</li>
                <li>Never share your password with anyone</li>
                <li>Enable two-factor authentication for extra security</li>
                <li>Regularly update your password every 3-6 months</li>
                <li>Be cautious of phishing emails asking for your credentials</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 40px 0 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.3s;">
                Sign In to Your Account
              </a>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/support" 
                 style="display: inline-block; color: #6b7280; text-decoration: none; font-size: 14px; border-bottom: 1px solid #6b7280;">
                Need help? Contact Support
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center; font-style: italic;">
              This is an automated security notification. For your protection, we send this email whenever your password is changed.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                MartNexus
              </h2>
              <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">
                Smart Inventory Management System
              </p>
            </div>
            <div style="border-top: 1px solid #374151; padding-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} MartNexus. All rights reserved.
              </p>
              <p style="color: #6b7280; font-size: 11px; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
      type: 'PASSWORD_CHANGE',
      metadata: {
        userName,
        changeTime,
        ipAddress: changeDetails.ipAddress,
        userAgent: changeDetails.userAgent
      }
    });
  }
}


const emailService = new EmailService();

module.exports = emailService;
