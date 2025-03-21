import { createTransport } from 'nodemailer';
import { config } from '@shared/config';

interface ErrorNotificationOptions {
  subject?: string;
  stackTrace?: string | null;
  additionalInfo?: Record<string, any>;
}

// Create a reusable transporter object using the default SMTP transport
// You'll need to provide your SMTP credentials in environment variables
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: process.env.NODE_ENV === 'development', // Enable logging in development
  debug: process.env.NODE_ENV === 'development', // Include debug info in development
});

/**
 * Send an error notification email to the site administrator
 */
export async function sendErrorNotification(error: Error, options: ErrorNotificationOptions = {}) {
  if (!process.env.ADMIN_EMAIL || !process.env.SMTP_USER) {
    console.error('Email notifications are not configured. Set ADMIN_EMAIL and SMTP credentials in environment variables.');
    return;
  }

  const { subject = 'Website Error Alert', stackTrace = error.stack, additionalInfo = {} } = options;

  try {
    // Get environment information
    const env = process.env.NODE_ENV || 'development';
    const envStyle = env === 'production' 
      ? 'background-color: #d32f2f; color: white; font-weight: bold; padding: 3px 6px; border-radius: 3px;'
      : 'background-color: #388e3c; color: white; font-weight: bold; padding: 3px 6px; border-radius: 3px;';
    const envTag = env === 'production' ? '🔴 PROD' : '🟢 DEV';
    
    // Format the error information
    const errorDetails = `
      <h2>Error Details:</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Environment:</strong> <span style="${envStyle}">${env.toUpperCase()}</span></p>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>URL:</strong> ${additionalInfo.url || 'Not available'}</p>
      <p><strong>User Agent:</strong> ${additionalInfo.userAgent || 'Not available'}</p>
      
      <h3>Stack Trace:</h3>
      <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto;">${stackTrace || 'No stack trace available'}</pre>
      
      <h3>Additional Information:</h3>
      <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto;">${JSON.stringify(additionalInfo, null, 2)}</pre>
    `;
    
    const mailOptions = {
      from: `"Viba Chic Error Monitor" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `[${envTag}] ${subject} - Viba Chic Website`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f; border-bottom: 1px solid #eee; padding-bottom: 10px;">⚠️ Website Error Alert</h1>
          <p>An error has occurred on your Viba Chic website. Please review the details below:</p>
          ${errorDetails}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated message from your website's error monitoring system.</p>
            <p>To stop receiving these alerts, update your environment variables.</p>
          </div>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Error notification email sent:', info.messageId);
    return info;
  } catch (emailError) {
    console.error('Failed to send error notification email:', emailError);
  }
}

/**
 * Global error handler for uncaught exceptions and unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
  console.log('Setting up global error handlers for email notifications');
  // Always set up handlers regardless of environment
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    await sendErrorNotification(error, {
      subject: 'Uncaught Exception',
      additionalInfo: { type: 'uncaughtException' }
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await sendErrorNotification(error, {
      subject: 'Unhandled Promise Rejection',
      additionalInfo: { type: 'unhandledRejection' }
    });
  });

  console.log('Global error handlers set up for email notifications');
}