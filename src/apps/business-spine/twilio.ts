/**
 * Twilio SMS Adapter
 * Real implementation using Twilio API
 */

export interface SmsInput {
  to: string;
  text: string;
  from?: string;
  mediaUrls?: string[];
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function sendSms(input: SmsInput): Promise<SmsResult> {
  // Check if Twilio is configured
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[Twilio] Credentials not configured, skipping SMS send');
    console.log('[Twilio Mock]', {
      to: input.to,
      text: input.text.substring(0, 50)
    });
    return {
      success: false,
      error: 'Twilio credentials not configured'
    };
  }

  try {
    const fromNumber = input.from || TWILIO_PHONE_NUMBER;

    // Build form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('To', input.to);
    formData.append('From', fromNumber);
    formData.append('Body', input.text);

    if (input.mediaUrls && input.mediaUrls.length > 0) {
      input.mediaUrls.forEach(url => {
        formData.append('MediaUrl', url);
      });
    }

    // Create Basic Auth header
    const authHeader = 'Basic ' + Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[Twilio] API error:', response.status, responseData);
      return {
        success: false,
        error: `Twilio API error: ${responseData.message || response.status}`
      };
    }

    console.log('[Twilio] SMS sent successfully', {
      to: input.to,
      messageId: responseData.sid,
      status: responseData.status
    });

    return {
      success: true,
      messageId: responseData.sid
    };
  } catch (error) {
    console.error('[Twilio] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
