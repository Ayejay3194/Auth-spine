/**
 * SendGrid Email Adapter
 * Real implementation using SendGrid API
 */

export interface EmailInput {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@authspine.com';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

export async function sendEmail(input: EmailInput): Promise<EmailResult> {
  // Check if SendGrid is configured
  if (!SENDGRID_API_KEY) {
    console.warn('[SendGrid] API key not configured, skipping email send');
    console.log('[SendGrid Mock]', {
      to: input.to,
      subject: input.subject,
      text: input.text?.substring(0, 100)
    });
    return {
      success: false,
      error: 'SendGrid API key not configured'
    };
  }

  try {
    const personalizations: any[] = [];
    const recipients = Array.isArray(input.to) ? input.to : [input.to];

    for (const recipient of recipients) {
      const personalization: any = {
        to: [{ email: recipient }]
      };

      if (input.cc && input.cc.length > 0) {
        personalization.cc = input.cc.map(email => ({ email }));
      }

      if (input.bcc && input.bcc.length > 0) {
        personalization.bcc = input.bcc.map(email => ({ email }));
      }

      if (input.dynamicTemplateData) {
        personalization.dynamic_template_data = input.dynamicTemplateData;
      }

      personalizations.push(personalization);
    }

    const payload: any = {
      personalizations,
      from: { email: input.from || SENDGRID_FROM_EMAIL },
      subject: input.subject
    };

    if (input.replyTo) {
      payload.reply_to = { email: input.replyTo };
    }

    if (input.templateId) {
      payload.template_id = input.templateId;
    } else {
      payload.content = [];
      if (input.text) {
        payload.content.push({
          type: 'text/plain',
          value: input.text
        });
      }
      if (input.html) {
        payload.content.push({
          type: 'text/html',
          value: input.html
        });
      }
    }

    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SendGrid] API error:', response.status, errorText);
      return {
        success: false,
        error: `SendGrid API error: ${response.status}`
      };
    }

    const messageId = response.headers.get('x-message-id');

    console.log('[SendGrid] Email sent successfully', {
      to: input.to,
      subject: input.subject,
      messageId
    });

    return {
      success: true,
      messageId: messageId || undefined
    };
  } catch (error) {
    console.error('[SendGrid] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
