import { Resend } from 'resend'
import { WelcomeEmail } from './templates/welcome'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? 'noreply@example.com'
}

export async function sendWelcomeEmail(to: string, name: string) {
  const client = getResend()

  return client.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Welcome to T42',
    react: WelcomeEmail({ name })
  })
}

export { WelcomeEmail } from './templates'
