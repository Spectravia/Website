/**
 * Builds the notification email for a contact form submission.
 */
import type { ContactSubmission } from '#shared/schemas/contact'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)

export function buildContactEmail(data: ContactSubmission, meta: { ip?: string, receivedAt: Date }) {
  const fullName = `${data.firstName} ${data.lastName}`
  const rows: [string, string][] = [
    ['Name', fullName],
    ['Email', data.email],
    ['Company', data.company || '—'],
    ['Phone', data.phone || '—'],
    ['Topic', data.topic],
    ['Language', data.locale],
    ['Received', meta.receivedAt.toISOString()],
  ]

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    data.message,
  ].join('\n')

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#1d1d2b;max-width:640px">
  <h2 style="margin:0 0 16px;color:#7B3EEC">New contact request</h2>
  <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
    ${rows.map(([k, v]) => `<tr><td style="color:#666;padding-right:16px">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join('')}
  </table>
  <h3 style="margin:24px 0 8px">Message</h3>
  <p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:0">${escapeHtml(data.message)}</p>
</div>`.trim()

  return {
    subject: `${data.topic} — ${fullName}`,
    text,
    html,
  }
}
