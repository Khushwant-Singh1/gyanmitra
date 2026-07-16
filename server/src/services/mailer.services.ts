import nodemailer from 'nodemailer';
import { templatesReturn } from '../utils/emailTemplates.utils';
import { ApiError } from '../utils/ApiError.utils';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface EmailOptions {
  to: string;
  subject: string;
  emailTemplate: templatesReturn;
}

// Regular expression for validating email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  options: EmailOptions
): Promise<SMTPTransport.SentMessageInfo> => {
  if (!isValidEmail(options.to)) {
    throw new ApiError(400, 'Invalid email address format.');
  }

  const mailOptions = {
    to: options.to,
    subject: options.subject,
    text: options.emailTemplate.text,
    html: options.emailTemplate.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ApiError(500, 'Problem on sending mail');
  }
};
