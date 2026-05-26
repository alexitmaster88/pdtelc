"use client"

import { useState } from "react"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface FormData {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  passportNumber: string
  agreeTerms: boolean
  emailVerified: boolean
}

interface Props {
  data: FormData
  lang: string
  onDataChange: (data: Partial<FormData>) => void
  onNext: () => void
}

const labels: Record<string, Record<string, string>> = {
  en: {
    title: "Personal Information", firstName: "First Name", lastName: "Last Name",
    phone: "Phone Number", email: "Email", passport: "Passport Number",
    terms: "I agree to the terms and conditions", sendOtp: "Send OTP",
    enterOtp: "Enter 6-digit OTP sent to your email", verifyOtp: "Verify",
    next: "Next →", verified: "Verified",
    errFirst: "First name is required", errLast: "Last name is required",
    errPhone: "Phone number is required", errEmail: "Valid email required",
    errPassport: "Passport number is required", errTerms: "You must agree to the terms",
    errOtp: "Invalid OTP code", otpSent: "OTP sent to your email",
    otpFail: "Failed to send OTP", otpSuccess: "Email verified!",
  },
  de: {
    title: "Persönliche Daten", firstName: "Vorname", lastName: "Nachname",
    phone: "Telefonnummer", email: "E-Mail", passport: "Passnummer",
    terms: "Ich stimme den AGB zu", sendOtp: "OTP senden",
    enterOtp: "6-stelligen OTP-Code eingeben", verifyOtp: "Prüfen",
    next: "Weiter →", verified: "Verifiziert",
    errFirst: "Vorname erforderlich", errLast: "Nachname erforderlich",
    errPhone: "Telefonnummer erforderlich", errEmail: "Gültige E-Mail erforderlich",
    errPassport: "Passnummer erforderlich", errTerms: "Bitte stimmen Sie zu",
    errOtp: "Ungültiger OTP-Code", otpSent: "OTP gesendet",
    otpFail: "OTP-Versand fehlgeschlagen", otpSuccess: "E-Mail verifiziert!",
  },
  ru: {
    title: "Личные данные", firstName: "Имя", lastName: "Фамилия",
    phone: "Телефон", email: "Email", passport: "Номер паспорта",
    terms: "Я согласен с условиями", sendOtp: "Отправить OTP",
    enterOtp: "Введите 6-значный код из письма", verifyOtp: "Подтвердить",
    next: "Далее →", verified: "Подтверждено",
    errFirst: "Введите имя", errLast: "Введите фамилию",
    errPhone: "Введите телефон", errEmail: "Введите корректный email",
    errPassport: "Введите номер паспорта", errTerms: "Необходимо согласие",
    errOtp: "Неверный OTP", otpSent: "OTP отправлен на email",
    otpFail: "Ошибка отправки OTP", otpSuccess: "Email подтверждён!",
  },
  uz: {
    title: "Shaxsiy ma'lumotlar", firstName: "Ism", lastName: "Familiya",
    phone: "Telefon", email: "Email", passport: "Pasport raqami",
    terms: "Shartlarga roziman", sendOtp: "OTP yuborish",
    enterOtp: "Emailingizga yuborilgan 6 xonali kodni kiriting", verifyOtp: "Tasdiqlash",
    next: "Keyingi →", verified: "Tasdiqlandi",
    errFirst: "Ism kiritish shart", errLast: "Familiya kiritish shart",
    errPhone: "Telefon kiritish shart", errEmail: "To'g'ri email kiriting",
    errPassport: "Pasport raqami kiritish shart", errTerms: "Shartlarga rozi bo'ling",
    errOtp: "Noto'g'ri OTP kodi", otpSent: "OTP emailingizga yuborildi",
    otpFail: "OTP yuborishda xato", otpSuccess: "Email tasdiqlandi!",
  },
}

export default function StepPersonalInfo({ data, lang, onDataChange, onNext }: Props) {
  const l = labels[lang] ?? labels.en
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpVisible, setOtpVisible] = useState(false)
  const [otp, setOtp] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.firstName.trim()) e.firstName = l.errFirst
    if (!data.lastName.trim()) e.lastName = l.errLast
    if (!data.phoneNumber.trim()) e.phoneNumber = l.errPhone
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = l.errEmail
    if (!data.passportNumber.trim()) e.passportNumber = l.errPassport
    if (!data.agreeTerms) e.agreeTerms = l.errTerms
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSendOtp = async () => {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setErrors({ email: l.errEmail })
      return
    }
    setSendingOtp(true)
    try {
      const res = await fetch("/api/telc/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const message = (errorData as any).error || `Server error: ${res.status}`
        throw new Error(message)
      }
      setOtpVisible(true)
      toast.success(l.otpSent)
    } catch (err) {
      console.error("OTP send failed:", err)
      toast.error(l.otpFail)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setErrors({ otp: l.errOtp }); return }
    setVerifyingOtp(true)
    try {
      const res = await fetch("/api/telc/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, otp }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const message = (errorData as any).error || `Server error: ${res.status}`
        throw new Error(message)
      }
      onDataChange({ emailVerified: true })
      setOtpVisible(false)
      toast.success(l.otpSuccess)
    } catch (err) {
      console.error("OTP verify failed:", err)
      setErrors({ otp: l.errOtp })
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext()
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
  const labelCls = "mb-1 block text-sm font-medium text-slate-700"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{l.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{l.firstName}<span className="text-red-500 ml-0.5">*</span></label>
            <input className={inputCls} value={data.firstName}
              onChange={(e) => onDataChange({ firstName: e.target.value })} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label className={labelCls}>{l.lastName}<span className="text-red-500 ml-0.5">*</span></label>
            <input className={inputCls} value={data.lastName}
              onChange={(e) => onDataChange({ lastName: e.target.value })} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>{l.phone}<span className="text-red-500 ml-0.5">*</span></label>
          <input className={inputCls} type="tel" placeholder="+998 XX XXX XX XX"
            value={data.phoneNumber} onChange={(e) => onDataChange({ phoneNumber: e.target.value })} />
          {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label className={labelCls}>{l.email}<span className="text-red-500 ml-0.5">*</span></label>
          <div className="flex gap-2">
            <input className={`${inputCls} flex-1`} type="email" placeholder="example@email.com"
              value={data.email} disabled={data.emailVerified}
              onChange={(e) => onDataChange({ email: e.target.value, emailVerified: false })} />
            {data.emailVerified ? (
              <div className="flex items-center gap-1 px-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                <CheckCircle size={16} /> {l.verified}
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleSendOtp}
                disabled={sendingOtp || !data.email} className="rounded-xl shrink-0">
                {sendingOtp ? <Loader2 size={16} className="animate-spin mr-1" /> : <Mail size={16} className="mr-1" />}
                {l.sendOtp}
              </Button>
            )}
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        {otpVisible && !data.emailVerified && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <label className="mb-2 block text-sm font-medium text-blue-900">{l.enterOtp}</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.5em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="000000" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              <Button type="button" onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length < 6} className="rounded-xl shrink-0">
                {verifyingOtp ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
                {l.verifyOtp}
              </Button>
            </div>
            {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp}</p>}
          </div>
        )}

        <div>
          <label className={labelCls}>{l.passport}<span className="text-red-500 ml-0.5">*</span></label>
          <input className={inputCls} placeholder="AA1234567" value={data.passportNumber}
            onChange={(e) => onDataChange({ passportNumber: e.target.value.toUpperCase() })} />
          {errors.passportNumber && <p className="mt-1 text-xs text-red-600">{errors.passportNumber}</p>}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.agreeTerms}
            onChange={(e) => onDataChange({ agreeTerms: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
          <span className="text-sm text-slate-700">{l.terms}<span className="text-red-500 ml-0.5">*</span></span>
        </label>
        {errors.agreeTerms && <p className="text-xs text-red-600">{errors.agreeTerms}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={!data.emailVerified}>
          {l.next}
        </Button>
      </form>
    </div>
  )
}
