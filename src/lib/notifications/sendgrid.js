import 'server-only'

export async function sendNotificationEmail({ to, subject, text }) {
  const apiKey = process.env.SENDGRID_API_KEY
  const from = process.env.SENDGRID_FROM_EMAIL
  if (!apiKey || !from) throw new Error('Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.')

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'CLANVERSE' },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`SendGrid rejected the email (${response.status}): ${detail.slice(0, 300)}`)
  }
}
