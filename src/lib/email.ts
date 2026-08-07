import { Resend } from 'resend'

interface ScheduledPostEmailParams {
  success: boolean
  content: string
  failureReason?: string
}

export async function sendScheduledPostEmail(userEmail: string, params: ScheduledPostEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    console.error('[Email] RESEND_API_KEY or RESEND_FROM_EMAIL not configured, skipping notification email.')
    return { error: 'Email not configured' }
  }

  const resend = new Resend(apiKey)

  const subject = params.success ? 'Your scheduled Threads post was published' : 'Your scheduled Threads post failed to publish'

  const html = params.success
    ? `<p>Your scheduled post just went live on Threads:</p><blockquote>${escapeHtml(params.content)}</blockquote>`
    : `<p>Your scheduled post failed to publish to Threads.</p>` +
      (params.failureReason ? `<p><strong>Reason:</strong> ${escapeHtml(params.failureReason)}</p>` : '') +
      `<blockquote>${escapeHtml(params.content)}</blockquote>` +
      `<p>You can edit and retry it from your Saved Posts page.</p>`

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      html,
    })
    return { success: true, id: result.data?.id }
  } catch (err: any) {
    console.error('[Email] Failed to send notification email:', err)
    return { error: err.message || 'Failed to send email' }
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
