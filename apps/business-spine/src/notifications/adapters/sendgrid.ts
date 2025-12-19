export async function sendEmail(input: { to: string; subject: string; text: string }) { console.log('SENDGRID', input.to, input.subject); }
