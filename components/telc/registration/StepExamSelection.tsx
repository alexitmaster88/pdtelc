"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  data: any
  lang: string
  existingRegistrationId?: number | null
  onDataChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  onRegistrationComplete: (regId: number) => void
}

const REGIONS = [
  { code: "tashkent" }, { code: "samarkand" }, { code: "fergana" },
  { code: "kashkadarya" }, { code: "bukhara" }, { code: "urgench" },
]

const regionLabels: Record<string, Record<string, string>> = {
  en: { tashkent: "Tashkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kashkadarya", bukhara: "Bukhara", urgench: "Urgench" },
  de: { tashkent: "Taschkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kaschkadarya", bukhara: "Buchara", urgench: "Urgentsch" },
  ru: { tashkent: "Ташкент", samarkand: "Самарканд", fergana: "Фергана", kashkadarya: "Кашкадарья", bukhara: "Бухара", urgench: "Ургенч" },
  uz: { tashkent: "Toshkent", samarkand: "Samarqand", fergana: "Farg'ona", kashkadarya: "Qashqadaryo", bukhara: "Buxoro", urgench: "Urganch" },
}

const ui: Record<string, Record<string, string>> = {
  en: { title: "Exam Selection", region: "Region", level: "Level", date: "Date", time: "Time", selectRegion: "Select region", selectLevel: "Select level", selectDate: "Select date", selectTime: "Select time", noExams: "No exams available for selected region and level", previous: "← Previous", next: "Next →", summary: "Summary", submitting: "Creating registration...", errRegion: "Select a region", errLevel: "Select a level", errDate: "Select a date", errTime: "Select a time", errFail: "Failed to create registration" },
  de: { title: "Prüfung wählen", region: "Region", level: "Stufe", date: "Datum", time: "Zeit", selectRegion: "Region wählen", selectLevel: "Stufe wählen", selectDate: "Datum wählen", selectTime: "Zeit wählen", noExams: "Keine Prüfungen verfügbar", previous: "← Zurück", next: "Weiter →", summary: "Zusammenfassung", submitting: "Anmeldung wird erstellt...", errRegion: "Wählen Sie eine Region", errLevel: "Wählen Sie eine Stufe", errDate: "Wählen Sie ein Datum", errTime: "Wählen Sie eine Zeit", errFail: "Anmeldung fehlgeschlagen" },
  ru: { title: "Выбор экзамена", region: "Регион", level: "Уровень", date: "Дата", time: "Время", selectRegion: "Выберите регион", selectLevel: "Выберите уровень", selectDate: "Выберите дату", selectTime: "Выберите время", noExams: "Нет доступных экзаменов", previous: "← Назад", next: "Далее →", summary: "Итоги", submitting: "Создание записи...", errRegion: "Выберите регион", errLevel: "Выберите уровень", errDate: "Выберите дату", errTime: "Выберите время", errFail: "Ошибка создания записи" },
  uz: { title: "Imtihon tanlash", region: "Hudud", level: "Daraja", date: "Sana", time: "Vaqt", selectRegion: "Hudud tanlang", selectLevel: "Daraja tanlang", selectDate: "Sana tanlang", selectTime: "Vaqt tanlang", noExams: "Tanlangan hudud va darajada imtihon yo'q", previous: "← Oldingi", next: "Keyingi →", summary: "Xulosa", submitting: "Ro'yxat yaratilmoqda...", errRegion: "Hudud tanlang", errLevel: "Daraja tanlang", errDate: "Sana tanlang", errTime: "Vaqt tanlang", errFail: "Ro'yxatdan o'tishda xato" },
}

export default function StepExamSelection({ data, lang, existingRegistrationId, onDataChange, onNext, onPrevious, onRegistrationComplete }: Props) {
  const l = ui[lang] ?? ui.en
  const rl = regionLabels[lang] ?? regionLabels.en
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [exams, setExams] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(data.selectedDate ?? "")
  const [selectedTime, setSelectedTime] = useState(data.selectedTime ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/telc/exam-levels").then(r => r.json()).then(setLevels).catch(() => {})
  }, [])

  useEffect(() => {
    if (!data.region || !data.levelId) { setExams([]); return }
    fetch(`/api/telc/exams?region=${data.region}&levelId=${data.levelId}`)
      .then(r => r.json()).then(setExams).catch(() => {})
  }, [data.region, data.levelId])

  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    exams.forEach(e => dates.add(e.exam_date.split("T")[0]))
    return Array.from(dates).sort()
  }, [exams])

  const availableTimes = useMemo(() => {
    if (!selectedDate) return []
    const times = new Set<string>()
    exams.forEach(e => { if (e.exam_date.split("T")[0] === selectedDate) times.add(e.start_time) })
    return Array.from(times).sort()
  }, [exams, selectedDate])

  const selectedExam = useMemo(() =>
    exams.find(e => e.exam_date.split("T")[0] === selectedDate && e.start_time === selectedTime),
    [exams, selectedDate, selectedTime])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.region) e.region = l.errRegion
    if (!data.levelId) e.level = l.errLevel
    if (!selectedDate) e.date = l.errDate
    if (!selectedTime) e.time = l.errTime
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !selectedExam) return

    // If registration was already created (user went back from step 3), skip POST
    if (existingRegistrationId) {
      onDataChange({ examId: selectedExam.id, selectedDate, selectedTime, examAmount: selectedExam.exam_levels?.price })
      onRegistrationComplete(existingRegistrationId)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/telc/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          firstName: data.firstName, lastName: data.lastName,
          phoneNumber: data.phoneNumber, email: data.email,
          passportNumber: data.passportNumber,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error((d as any).error ?? l.errFail)
      }
      const reg = await res.json()
      onDataChange({ examId: selectedExam.id, selectedDate, selectedTime, examAmount: selectedExam.exam_levels?.price })
      onRegistrationComplete(reg.id)
      toast.success("Registration created!")
    } catch (err: any) {
      toast.error(err.message ?? l.errFail)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
  const labelCls = "mb-1 flex items-center gap-1 text-sm font-medium text-slate-700"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{l.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls}>{l.region}<span className="text-red-500 ml-0.5">*</span></label>
          <select className={selectCls} value={data.region ?? ""} onChange={e => { onDataChange({ region: e.target.value, levelId: "", selectedDate: "", selectedTime: "" }); setSelectedDate(""); setSelectedTime(""); }}>
            <option value="">{l.selectRegion}</option>
            {REGIONS.map(r => <option key={r.code} value={r.code}>{rl[r.code]}</option>)}
          </select>
          {errors.region && <p className="mt-1 text-xs text-red-600">{errors.region}</p>}
        </div>

        <div>
          <label className={labelCls}>{l.level}<span className="text-red-500 ml-0.5">*</span></label>
          <select className={selectCls} value={data.levelId ?? ""} disabled={!data.region}
            onChange={e => { onDataChange({ levelId: e.target.value, selectedDate: "", selectedTime: "" }); setSelectedDate(""); setSelectedTime(""); }}>
            <option value="">{l.selectLevel}</option>
            {levels.map(lv => <option key={lv.id} value={lv.id}>{lv.level}</option>)}
          </select>
          {errors.level && <p className="mt-1 text-xs text-red-600">{errors.level}</p>}
        </div>

        {data.region && data.levelId && (
          <div>
            <label className={labelCls}><Calendar size={16} />{l.date}<span className="text-red-500 ml-0.5">*</span></label>
            <select className={selectCls} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }}>
              <option value="">{l.selectDate}</option>
              {availableDates.map(d => <option key={d} value={d}>{new Date(d).toLocaleDateString()}</option>)}
            </select>
            {availableDates.length === 0 && <p className="mt-1 text-xs text-amber-600">{l.noExams}</p>}
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>
        )}

        {selectedDate && (
          <div>
            <label className={labelCls}><Clock size={16} />{l.time}<span className="text-red-500 ml-0.5">*</span></label>
            <select className={selectCls} value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
              <option value="">{l.selectTime}</option>
              {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
          </div>
        )}

        {selectedExam && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
            <p className="font-semibold text-blue-900 mb-2">{l.summary}</p>
            <p><strong>{l.region}:</strong> {rl[data.region]}</p>
            <p><strong>{l.level}:</strong> {selectedExam.exam_levels?.level}</p>
            <p><strong>{l.date}:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
            <p><strong>{l.time}:</strong> {selectedTime}</p>
            {selectedExam.exam_levels?.price && <p><strong>Price:</strong> {Number(selectedExam.exam_levels.price).toLocaleString()} UZS</p>}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onPrevious} className="flex-1">{l.previous}</Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting || !selectedExam}>
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {isSubmitting ? l.submitting : l.next}
          </Button>
        </div>
      </form>
    </div>
  )
}
