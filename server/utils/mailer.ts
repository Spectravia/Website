/**
 * SMTP mail transport (nodemailer), configured from runtimeConfig.mail.
 * The transporter is created lazily and reused across requests.
 */
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

export interface OutgoingMail {
  subject: string
  text: string
  html: string
  replyTo?: string
}

function getTransporter(): Transporter {
  if (transporter) return transporter

  const { mail } = useRuntimeConfig()
  if (!mail.smtpHost || !mail.smtpUser || !mail.smtpPass) {
    throw createError({ statusCode: 500, statusMessage: 'Mail transport is not configured' })
  }

  transporter = nodemailer.createTransport({
    host: mail.smtpHost,
    port: Number(mail.smtpPort),
    secure: String(mail.smtpSecure) === 'true',
    auth: { user: mail.smtpUser, pass: mail.smtpPass },
  })
  return transporter
}

export async function sendMail(message: OutgoingMail): Promise<void> {
  const { mail } = useRuntimeConfig()
  const to = String(mail.to).split(',').map(s => s.trim()).filter(Boolean)

  await getTransporter().sendMail({
    from: mail.from || mail.smtpUser,
    to,
    subject: `${mail.subjectPrefix} ${message.subject}`.trim(),
    text: message.text,
    html: message.html,
    replyTo: message.replyTo,
  })
}
