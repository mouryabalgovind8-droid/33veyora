import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates directory (works in dev "src/" and compiled "dist/" builds)
const templatesDir = fs.existsSync(path.join(__dirname, '../templates/emails'))
  ? path.join(__dirname, '../templates/emails')
  : path.join(__dirname, '../../src/templates/emails');

// Template variables interface
interface TemplateVariables {
  [key: string]: string;
}

// Read and process email template
function loadTemplate(templateName: string, variables: TemplateVariables): string {
  const templatePath = path.join(templatesDir, `${templateName}.html`);
  
  try {
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace all template variables ({{variable_name}})
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value);
    });
    
    return template;
  } catch (error) {
    console.error(`Failed to load email template: ${templateName}`, error);
    throw new Error(`Email template not found: ${templateName}`);
  }
}

// Send email via nodemailer
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // Check if SMTP is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n📧 [SIMULATED] Email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ⚠️  SMTP not configured. Set SMTP_USER and SMTP_PASS in .env\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `33veyora <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`\n📧 Email sent to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   ✅ Real email sent successfully!\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Failed to send email to ${to}:`, error);
    // Still return true so the app doesn't break
    return true;
  }
}

// Notification Service
export const NotificationService = {
  // Send booking confirmation email
  async sendBookingConfirmation(userEmail: string, userName: string, bookingData: {
    propertyName: string;
    location: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    bookingId: string;
    totalAmount: number;
  }): Promise<boolean> {
    const variables: TemplateVariables = {
      user_email: userEmail,
      user_name: userName,
      property_name: bookingData.propertyName,
      location: bookingData.location,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      guest_count: bookingData.guestCount.toString(),
      booking_id: bookingData.bookingId,
      total_amount: bookingData.totalAmount.toLocaleString('en-IN'),
      view_booking_url: `http://localhost:5173/my-bookings`,
      help_url: 'http://localhost:5173/help',
      safety_url: 'http://localhost:5173/help#safety',
      terms_url: 'http://localhost:5173/help',
    };
    
    const html = loadTemplate('booking-confirmation', variables);
    return sendEmail(userEmail, 'Booking Confirmed - 33veyora', html);
  },
  
  // Send password reset email
  async sendPasswordReset(userEmail: string, otpCode: string): Promise<boolean> {
    const variables: TemplateVariables = {
      user_email: userEmail,
      otp_code: otpCode,
      reset_url: `http://localhost:5173/forgot-password`,
      help_url: 'http://localhost:5173/help',
      safety_url: 'http://localhost:5173/help#safety',
      terms_url: 'http://localhost:5173/help',
    };
    
    const html = loadTemplate('password-reset', variables);
    return sendEmail(userEmail, 'Reset Your Password - 33veyora', html);
  },
  
  // Send welcome email
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const variables: TemplateVariables = {
      user_email: userEmail,
      user_name: userName,
      explore_url: 'http://localhost:5173/',
      help_url: 'http://localhost:5173/help',
      safety_url: 'http://localhost:5173/help#safety',
      terms_url: 'http://localhost:5173/help',
    };
    
    const html = loadTemplate('welcome', variables);
    return sendEmail(userEmail, 'Welcome to 33veyora! 🎉', html);
  },
  
  // Send vendor booking request notification
  async sendVendorBookingRequest(vendorEmail: string, vendorName: string, bookingData: {
    guestName: string;
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    bookingId: string;
  }): Promise<boolean> {
    const subject = `New Booking Request - ${bookingData.propertyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking Request</h2>
        <p>Hi ${vendorName},</p>
        <p>You have a new booking request for <strong>${bookingData.propertyName}</strong>.</p>
        <ul>
          <li>Guest: ${bookingData.guestName}</li>
          <li>Check-in: ${bookingData.checkInDate}</li>
          <li>Check-out: ${bookingData.checkOutDate}</li>
          <li>Booking ID: ${bookingData.bookingId}</li>
        </ul>
        <p>Please review and accept or reject this booking in your vendor dashboard.</p>
        <a href="http://localhost:5173/vendor/bookings" style="display: inline-block; padding: 12px 24px; background-color: #1e1b4b; color: white; text-decoration: none; border-radius: 8px;">View Booking</a>
      </div>
    `;
    
    return sendEmail(vendorEmail, subject, html);
  },
  
  // Send admin notification for new vendor registration
  async sendAdminNewVendorNotification(adminEmail: string, vendorData: {
    vendorName: string;
    vendorEmail: string;
    businessName: string;
  }): Promise<boolean> {
    const subject = `New Vendor Registration - ${vendorData.businessName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Vendor Registration</h2>
        <p>A new vendor has registered and is awaiting approval.</p>
        <ul>
          <li>Vendor Name: ${vendorData.vendorName}</li>
          <li>Email: ${vendorData.vendorEmail}</li>
          <li>Business Name: ${vendorData.businessName}</li>
        </ul>
        <p>Please review their KYC documents and approve or reject their application.</p>
        <a href="http://localhost:5173/admin/vendors" style="display: inline-block; padding: 12px 24px; background-color: #1e1b4b; color: white; text-decoration: none; border-radius: 8px;">Review Vendor</a>
      </div>
    `;
    
    return sendEmail(adminEmail, subject, html);
  },
  
  // Send review notification to vendor
  async sendReviewNotification(vendorEmail: string, vendorName: string, reviewData: {
    guestName: string;
    propertyName: string;
    rating: number;
    comment: string;
  }): Promise<boolean> {
    const subject = `New Review on ${reviewData.propertyName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Review Received</h2>
        <p>Hi ${vendorName},</p>
        <p>You received a new review on <strong>${reviewData.propertyName}</strong>.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>${reviewData.guestName}</strong> - ${'⭐'.repeat(reviewData.rating)}</p>
          <p style="color: #6b7280;">"${reviewData.comment}"</p>
        </div>
        <a href="http://localhost:5173/vendor/listings" style="display: inline-block; padding: 12px 24px; background-color: #1e1b4b; color: white; text-decoration: none; border-radius: 8px;">View Reviews</a>
      </div>
    `;
    
    return sendEmail(vendorEmail, subject, html);
  },
};

export default NotificationService;
