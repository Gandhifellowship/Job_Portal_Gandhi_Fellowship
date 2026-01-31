import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { emailTemplates } from './email-templates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: { method: string; url: string; body: unknown }, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { json: (data: unknown) => void; end: () => void }; json: (data: unknown) => void }) {
  console.log('=== API ROUTE START ===');
  console.log('API Route called:', req.method, req.url);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('POST request processing...');

  // Validate environment variables first
  try {
    console.log('Checking environment variables...');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return res.status(500).json({ error: 'Server configuration error: Missing Supabase URL' });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({ error: 'Server configuration error: Missing Service Role Key' });
    }
    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return res.status(500).json({ error: 'Server configuration error: Missing Resend API Key' });
    }
    console.log('Environment variables validated successfully');
  } catch (envError) {
    console.error('Environment validation error:', envError);
    return res.status(500).json({ error: 'Environment validation failed' });
  }

  try {
    console.log('1. Starting form parsing...');
    
    // Use formidable to parse FormData properly
    const form = formidable({
      maxFileSize: 4 * 1024 * 1024, // 4MB limit
      keepExtensions: true,
      multiples: false,
    });
    
    console.log('2. Form configured, parsing request...');
    const [fields, files] = await form.parse(req);
    
    console.log('3. Form parsed successfully');
    console.log('Fields:', Object.keys(fields));
    console.log('Files:', Object.keys(files));
    
    const jobId = Array.isArray(fields.jobId) ? fields.jobId[0] : fields.jobId;
    const full_name = Array.isArray(fields.full_name) ? fields.full_name[0] : fields.full_name;
    const batch = Array.isArray(fields.batch) ? fields.batch[0] : fields.batch;
    const gender = Array.isArray(fields.gender) ? fields.gender[0] : fields.gender;
    const email_official = Array.isArray(fields.email_official) ? fields.email_official[0] : fields.email_official;
    const email_personal = Array.isArray(fields.email_personal) ? fields.email_personal[0] : fields.email_personal;
    const phone_number = Array.isArray(fields.phone_number) ? fields.phone_number[0] : fields.phone_number;
    const big_bet = Array.isArray(fields.big_bet) ? fields.big_bet[0] : fields.big_bet;
    const fellowship_state = Array.isArray(fields.fellowship_state) ? fields.fellowship_state[0] : fields.fellowship_state;
    const home_state = Array.isArray(fields.home_state) ? fields.home_state[0] : fields.home_state;
    const fpc_name = Array.isArray(fields.fpc_name) ? fields.fpc_name[0] : fields.fpc_name;
    const state_spoc_name = Array.isArray(fields.state_spoc_name) ? fields.state_spoc_name[0] : fields.state_spoc_name;
    const resumeFile = files.resumeFile?.[0];
    
    console.log('4. Data extracted:', { 
      jobId, 
      full_name, 
      batch,
      gender,
      email_official, 
      email_personal,
      phone_number, 
      big_bet: !!big_bet,
      fellowship_state: !!fellowship_state,
      home_state: !!home_state,
      fpc_name: !!fpc_name,
      state_spoc_name: !!state_spoc_name
    });
    
    // Check if resume file exists
    if (!resumeFile) {
      console.error('No resume file found');
      return res.status(400).json({ error: 'Resume file is required' });
    }
    
    console.log('5. Resume file found:', resumeFile.originalFilename, 'Size:', resumeFile.size);

    console.log('Request data received:', { 
      jobId, 
      full_name: !!full_name, 
      batch: !!batch,
      gender: !!gender,
      email_official: !!email_official, 
      email_personal: !!email_personal,
      phone_number: !!phone_number,
      big_bet: !!big_bet,
      fellowship_state: !!fellowship_state,
      home_state: !!home_state,
      fpc_name: !!fpc_name,
      state_spoc_name: !!state_spoc_name,
      resumeFile: !!resumeFile 
    });

    // Validate required fields
    if (!jobId || !full_name || !batch || !gender || !email_official || !email_personal || !phone_number || !fellowship_state || !home_state) {
      console.log('Missing required fields:', { 
        jobId: !!jobId, 
        full_name: !!full_name, 
        batch: !!batch,
        gender: !!gender,
        email_official: !!email_official,
        email_personal: !!email_personal,
        phone_number: !!phone_number,
        fellowship_state: !!fellowship_state,
        home_state: !!home_state
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create application data object
    const applicationData = {
      full_name,
      batch,
      gender,
      email_official,
      email_personal,
      phone_number,
      big_bet: big_bet || '',
      fellowship_state,
      home_state,
      fpc_name: fpc_name || '',
      state_spoc_name: state_spoc_name || ''
    };
    console.log('Application data:', applicationData);

    // Test database connection first
    console.log('6. Testing database connection...');
    const { error: testError } = await supabaseAdmin
      .from('jobs')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connection failed:', testError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    console.log('7. Database connection successful');

    // Get job details from Supabase
    console.log('8. Fetching job details for jobId:', jobId);
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('position, organisation_name, location')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error('Job fetch error:', jobError);
      return res.status(500).json({ error: 'Failed to fetch job details' });
    }
    
    console.log('9. Job details fetched:', job);

    // Upload resume to Supabase Storage (if file provided)
    let resumeUrl = null;
    if (resumeFile && resumeFile.size > 0) {
      console.log('Processing resume file:', { 
        name: resumeFile.originalFilename, 
        size: resumeFile.size, 
        type: resumeFile.mimetype 
      });
      
      // Check file size (Vercel limit: 4.5MB for serverless functions)
      if (resumeFile.size > 4 * 1024 * 1024) { // 4MB limit
        console.log('File too large:', resumeFile.size);
        return res.status(400).json({ error: 'File too large. Maximum size is 4MB.' });
      }
      
      // Sanitize filename to avoid URL encoding issues
      const sanitizedFilename = resumeFile.originalFilename
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/\s+/g, '_'); // Replace spaces with underscore
      
      const fileName = `${Date.now()}-${sanitizedFilename}`;
      
      // Read the file buffer
      console.log('10. Reading file buffer...');
      const fileBuffer = fs.readFileSync(resumeFile.filepath);
      console.log('File buffer size:', fileBuffer.length);
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('resumes')
        .upload(fileName, fileBuffer, {
          contentType: resumeFile.mimetype
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload resume' });
      }

      console.log('File uploaded successfully:', uploadData);

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('resumes')
        .getPublicUrl(fileName);
      
      resumeUrl = publicUrl;
      console.log('Resume URL generated:', resumeUrl);
      console.log('Bucket name used:', 'resumes');
      console.log('File name used:', fileName);
      
      // Clean up temporary file
      fs.unlinkSync(resumeFile.filepath);
    } else {
      console.log('No resume file provided or file is empty');
    }

    // Insert application into database using service role (bypasses RLS)
    console.log('Inserting application into database...');
    const applicationInsertData = {
      job_id: jobId,
      full_name: applicationData.full_name,
      batch: applicationData.batch,
      gender: applicationData.gender,
      email_official: applicationData.email_official,
      email_personal: applicationData.email_personal,
      phone_number: applicationData.phone_number,
      big_bet: applicationData.big_bet,
      fellowship_state: applicationData.fellowship_state,
      home_state: applicationData.home_state,
      fpc_name: applicationData.fpc_name,
      state_spoc_name: applicationData.state_spoc_name,
      resume_url: resumeUrl,
    };
    console.log('Application data to insert:', applicationInsertData);
    
    const { data: insertedApplication, error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert(applicationInsertData)
      .select('reference_number')
      .single();

    if (applicationError) {
      console.error('Application insert error:', applicationError);
      return res.status(500).json({ error: 'Failed to save application' });
    }

    console.log('Application inserted successfully:', insertedApplication);

    // Send email notification
    console.log('Sending email notification...');
    console.log('Resend API key present:', !!process.env.RESEND_API_KEY);
    console.log('Resend API key length:', process.env.RESEND_API_KEY?.length || 0);
    
    // Use shared email template for admin notification
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';
    const adminEmailTemplate = emailTemplates.adminNotification({
      candidate_name: applicationData.full_name,
      reference_number: insertedApplication.reference_number,
      job_title: job.position,
      job_department: job.organisation_name,
      job_location: job.location,
      admin_email: adminEmail
    });

    const fromEmail = process.env.FROM_EMAIL || process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@example.com';
    const recipientEmails = process.env.ADMIN_EMAILS 
      ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
      : adminEmail ? [adminEmail] : [];

    const emailData = {
      from: fromEmail,
      to: recipientEmails,
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
    };
    
    console.log('Email data prepared:', { to: emailData.to, subject: emailData.subject });
    
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      console.error('Resend error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message || 'Unknown email error'
      });
    }

    console.log('Email sent successfully:', data);

    return res.status(200).json({ 
      success: true, 
      messageId: data?.id,
      referenceNumber: insertedApplication.reference_number,
      message: 'Application submitted and email notification sent successfully' 
    });

  } catch (error) {
    console.error('=== API ROUTE ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    });
  }
}
