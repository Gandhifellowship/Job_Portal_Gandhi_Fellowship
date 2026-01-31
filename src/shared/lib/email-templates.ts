/**
 * Shared email templates for the application
 */

export interface EmailTemplateData {
  candidate_name: string;
  reference_number: string;
  job_title: string;
  job_department?: string;
  job_location?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export const emailTemplates = {
  /**
   * Application confirmation email template
   */
  applicationConfirmation: (data: EmailTemplateData): EmailTemplate => ({
    subject: `Application Confirmation - ${data.job_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #344354; margin: 0;">Gandhi Fellowship</h1>
          <p style="color: #6b7280; margin: 5px 0;">unfold impact enjoy</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Application Received</h2>
          
          <p style="color: #374151; line-height: 1.6;">Dear ${data.candidate_name},</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for your interest in the <strong>${data.job_title}</strong> position at Gandhi Fellowship.
            ${data.job_department ? `This role is in our ${data.job_department} department.` : ''}
            ${data.job_location ? `The position is based in ${data.job_location}.` : ''}
          </p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Reference Number:</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 18px; color: #2563eb; font-weight: bold;">${data.reference_number}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Your application has been successfully submitted and is now under review. 
            We will carefully evaluate your qualifications and get back to you within 2-3 business days.
          </p>
          
          <p style="color: #374151; line-height: 1.6;">
            Please keep this reference number for your records and use it in any future correspondence.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br><strong>The Gandhi Fellowship Team</strong></p>
          <p style="margin-top: 20px;">
            <a href="https://gandhifellowship.org" style="color: #F24F00; text-decoration: none;">Visit our website</a> | 
            <a href="mailto:careers@gandhifellowship.org" style="color: #F24F00; text-decoration: none;">Contact us</a>
          </p>
        </div>
      </div>
    `,
    text: `
      Gandhi Fellowship - Application Confirmation
      
      Dear ${data.candidate_name},
      
      Thank you for your interest in the ${data.job_title} position at Gandhi Fellowship.
      ${data.job_department ? `This role is in our ${data.job_department} department.` : ''}
      ${data.job_location ? `The position is based in ${data.job_location}.` : ''}
      
      Your application has been successfully submitted with reference number: ${data.reference_number}
      
      We will review your application and get back to you within 2-3 business days.
      
      Best regards,
      The Gandhi Fellowship Team
      
      Visit: https://gandhifellowship.org
      Email: careers@gandhifellowship.org
    `
  }),

  /**
   * Admin notification email template
   */
  adminNotification: (data: EmailTemplateData & { admin_email: string }): EmailTemplate => ({
    subject: `New Application Received - ${data.job_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #F24F00; margin: 0;">Gandhi Fellowship Admin</h1>
          <p style="color: #6b7280; margin: 5px 0;">New Application Alert</p>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">New Application Received</h2>
          
          <p style="color: #374151; line-height: 1.6;">A new application has been submitted for the following position:</p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Position:</strong> ${data.job_title}</p>
            ${data.job_department ? `<p style="margin: 5px 0; color: #374151;"><strong>Department:</strong> ${data.job_department}</p>` : ''}
            ${data.job_location ? `<p style="margin: 5px 0; color: #374151;"><strong>Location:</strong> ${data.job_location}</p>` : ''}
            <p style="margin: 5px 0; color: #374151;"><strong>Candidate:</strong> ${data.candidate_name}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Reference:</strong> ${data.reference_number}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Please review this application in the admin dashboard and take appropriate action.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is an automated notification from the Gandhi Fellowship job portal.</p>
        </div>
      </div>
    `,
    text: `
      Gandhi Fellowship Admin - New Application Alert
      
      A new application has been received:
      
      Position: ${data.job_title}
      ${data.job_department ? `Department: ${data.job_department}` : ''}
      ${data.job_location ? `Location: ${data.job_location}` : ''}
      Candidate: ${data.candidate_name}
      Reference: ${data.reference_number}
      
      Please review in the admin dashboard.
      
      This is an automated notification.
    `
  })
};

