import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Change this to your verified sender domain/email in Resend dashboard
const FROM = 'TELC Profi Deutsch <noreply@profi-deutsch.uz>'

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] OTP for ${email}: ${otp}`)
    return
  }

  const { error: sendError } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your TELC exam verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
        <h2 style="color:#1e293b;margin-top:0">Email Verification</h2>
        <p style="color:#475569">Use the code below to verify your email address for TELC exam registration:</p>
        <div style="background:#fff;border:2px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:14px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Profi Deutsch — TELC Exam Center, Tashkent, Uzbekistan</p>
      </div>
    `,
  })
  if (sendError) throw new Error(`Resend: ${sendError.message}`)
}

export async function sendRegistrationConfirmation(
  email: string,
  data: {
    registrationId: number
    firstName: string
    lastName: string
    level: string
    region: string
    examDate: Date
    startTime: string
  }
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Registration confirmation for ${email}:`, data)
    return
  }

  const dateStr = data.examDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const { error: sendError } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `TELC Registration Confirmed — #${data.registrationId}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
        <h2 style="color:#1e293b;margin-top:0">Registration Confirmed</h2>
        <p style="color:#475569">Dear ${data.firstName}, your TELC exam registration is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${[
            ['Registration ID', `#${data.registrationId}`],
            ['Full Name', `${data.firstName} ${data.lastName}`],
            ['Exam Level', data.level],
            ['Region', data.region],
            ['Exam Date', dateStr],
            ['Start Time', data.startTime],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0">${label}</td>
              <td style="padding:8px 0;font-weight:600;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;text-align:right">${value}</td>
            </tr>
          `).join('')}
        </table>
        <p style="color:#475569;font-size:14px">Please arrive <strong>30 minutes early</strong> and bring your passport.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px">Profi Deutsch — TELC Exam Center, Tashkent, Uzbekistan</p>
      </div>
    `,
  })
  if (sendError) throw new Error(`Resend: ${sendError.message}`)
}
