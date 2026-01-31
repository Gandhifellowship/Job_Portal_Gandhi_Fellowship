/**
 * Email service for client-side email functionality
 */

import { emailTemplates } from '@/shared/lib/email-templates';

export interface EmailData {
  candidate_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
  reference_number: string;
  job_title: string;
  job_department: string;
  job_location: string;
}

export const sendApplicationNotification = async (emailData: EmailData) => {
  try {
    const response = await fetch('/api/send-application-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
};

// Re-export templates for backward compatibility
export { emailTemplates };

