"use client"

import { CheckCircle, Download, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  registrationId: number
  formData: any
  lang: string
}

const ui: Record<string, Record<string, string>> = {
  en: { title: "You have successfully registered!", regId: "Registration ID", confirmDetails: "Confirmation Details", name: "Full Name", region: "Region", date: "Date", time: "Time", level: "Level", reminders: "Reminders", r1: "Arrive 30 minutes before the exam", r2: "Bring your passport (ID)", r3: "Latecomers will not be admitted", emailNote: "A confirmation email has been sent to", download: "Download Ticket", backHome: "Back to Home" },
  de: { title: "Sie haben sich erfolgreich angemeldet!", regId: "Anmelde-ID", confirmDetails: "Bestätigungsdetails", name: "Vollständiger Name", region: "Region", date: "Datum", time: "Zeit", level: "Stufe", reminders: "Erinnerungen", r1: "Kommen Sie 30 Minuten vor der Prüfung", r2: "Bringen Sie Ihren Pass (Ausweis) mit", r3: "Zu spät Kommende werden nicht zugelassen", emailNote: "Eine Bestätigungs-E-Mail wurde gesendet an", download: "Ticket herunterladen", backHome: "Zur Startseite" },
  ru: { title: "Вы успешно зарегистрированы!", regId: "ID регистрации", confirmDetails: "Детали подтверждения", name: "Полное имя", region: "Регион", date: "Дата", time: "Время", level: "Уровень", reminders: "Напоминания", r1: "Приходите за 30 минут до экзамена", r2: "Возьмите с собой паспорт", r3: "Опоздавших не допускают", emailNote: "Письмо с подтверждением отправлено на", download: "Скачать билет", backHome: "На главную" },
  uz: { title: "Siz muvaffaqiyatli ro'yxatdan o'tdingiz!", regId: "Ro'yxat ID", confirmDetails: "Tasdiqlash ma'lumotlari", name: "To'liq ism", region: "Hudud", date: "Sana", time: "Vaqt", level: "Daraja", reminders: "Eslatmalar", r1: "Imtihonga 30 daqiqa oldin keling", r2: "Pasport (ID) olib keling", r3: "Kech qolganlar kiritilmaydi", emailNote: "Tasdiqlash xati yuborildi:", download: "Chiptani yuklab olish", backHome: "Bosh sahifaga" },
}

const regionLabels: Record<string, Record<string, string>> = {
  en: { tashkent: "Tashkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kashkadarya", bukhara: "Bukhara", urgench: "Urgench" },
  de: { tashkent: "Taschkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kaschkadarya", bukhara: "Buchara", urgench: "Urgentsch" },
  ru: { tashkent: "Ташкент", samarkand: "Самарканд", fergana: "Фергана", kashkadarya: "Кашкадарья", bukhara: "Бухара", urgench: "Ургенч" },
  uz: { tashkent: "Toshkent", samarkand: "Samarqand", fergana: "Farg'ona", kashkadarya: "Qashqadaryo", bukhara: "Buxoro", urgench: "Urganch" },
}

export default function SuccessScreen({ registrationId, formData, lang }: Props) {
  const l = ui[lang] ?? ui.en
  const rl = regionLabels[lang] ?? regionLabels.en

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{l.title}</h2>
        <p className="text-slate-500 text-sm">{l.regId}: #{registrationId}</p>
      </div>

      {/* Confirmation Details */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 mb-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">{l.confirmDetails}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">{l.name}</p>
            <p className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{l.region}</p>
            <p className="font-semibold text-slate-900">{rl[formData.region] ?? formData.region}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{l.date}</p>
            <p className="font-semibold text-slate-900">
              {formData.selectedDate ? new Date(formData.selectedDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{l.time}</p>
            <p className="font-semibold text-slate-900">{formData.selectedTime ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500 mb-1">{l.level}</p>
            <p className="font-semibold text-slate-900">{formData.levelName ?? formData.levelId}</p>
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 mb-3">{l.reminders}</h3>
        <div className="space-y-2">
          {[["⏰", l.r1], ["🛂", l.r2], ["⚠️", l.r3]].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <span className="text-lg">{icon}</span>
              <p className="text-sm text-amber-900">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email notice */}
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        ✓ {l.emailNote} <strong>{formData.email}</strong>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="lg" className="flex-1"
          onClick={() => alert("PDF ticket download coming soon")}>
          <Download size={18} className="mr-2" />
          {l.download}
        </Button>
        <Button asChild size="lg" className="flex-1">
          <Link href={`/telc/${lang}`}>
            <Home size={18} className="mr-2" />
            {l.backHome}
          </Link>
        </Button>
      </div>
    </div>
  )
}
