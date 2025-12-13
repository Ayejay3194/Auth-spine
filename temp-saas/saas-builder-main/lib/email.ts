import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  from?: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const subject = 'Welcome to SaaS Builder Kit!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to SaaS Builder Kit! 🚀</h1>
      <p style="color: #666; line-height: 1.6;">
        Hi ${name || 'there'}, welcome aboard! We're excited to help you build your next SaaS application.
      </p>
      <p style="color: #666; line-height: 1.6;">
        Get started by browsing our template library and choose the perfect foundation for your project.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/templates" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Browse Templates
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If you have any questions, feel free to reply to this email or check out our documentation.
      </p>
      <p style="color: #666; line-height: 1.6;">
        Happy building! 🎉
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        This email was sent by SaaS Builder Kit. If you didn't expect this email, you can safely ignore it.
      </p>
    </div>
  `

  return sendEmail(email, subject, html)
}

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const subject = 'Reset your password'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Reset Your Password</h1>
      <p style="color: #666; line-height: 1.6;">
        You requested to reset your password. Click the link below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        This link will expire in 1 hour for security reasons.
      </p>
      <p style="color: #666; line-height: 1.6;">
        If you didn't request this password reset, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        This email was sent by SaaS Builder Kit.
      </p>
    </div>
  `

  return sendEmail(email, subject, html)
}
