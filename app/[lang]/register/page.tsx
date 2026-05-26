"use client"

import { use, useState } from "react"
import { ChevronLeft, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import StepPersonalInfo from "@/components/telc/registration/StepPersonalInfo"
import StepExamSelection from "@/components/telc/registration/StepExamSelection"
import StepPayment from "@/components/telc/registration/StepPayment"
import SuccessScreen from "@/components/telc/registration/SuccessScreen"
import { Toaster } from "sonner"

interface PageProps { params: Promise<{ lang: string }> }

const LANGUAGES = [
  { code: "de", label: "DE", name: "Deutsch", flag: "/images/flag-de.png" },
  { code: "en", label: "EN", name: "English", flag: "/images/flag-en.png" },
  { code: "ru", label: "RU", name: "Русский", flag: "/images/flag-ru.png" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "/images/flag-uz.png" },
]

const stepLabels: Record<string, string[]> = {
  en: ["Personal Info", "Exam Selection", "Payment", "Done"],
  de: ["Persönliche Daten", "Prüfung", "Zahlung", "Fertig"],
  ru: ["Личные данные", "Экзамен", "Оплата", "Готово"],
  uz: ["Ma'lumotlar", "Imtihon", "To'lov", "Tayyor"],
}

const headerLabels: Record<string, Record<string, string>> = {
  en: { title: "Exam Registration", back: "Back" },
  de: { title: "Prüfungsanmeldung", back: "Zurück" },
  ru: { title: "Регистрация на экзамен", back: "Назад" },
  uz: { title: "Imtihonga ro'yxat", back: "Orqaga" },
}

interface FormData {
  firstName: string; lastName: string; phoneNumber: string
  email: string; passportNumber: string; agreeTerms: boolean
  emailVerified: boolean; region: string; levelId: string
  levelName: string; examId: number | null; selectedDate: string
  selectedTime: string; examAmount: string; paymentMethod: string
}

export default function RegisterPage({ params }: PageProps) {
  const { lang } = use(params)
  const { language } = useLanguage()
  const initialLang = (["de","en","ru","uz"].includes(lang) ? lang : language) as string

  const [activeLang, setActiveLang] = useState(initialLang)
  const [step, setStep] = useState(1)
  const [registrationId, setRegistrationId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", phoneNumber: "", email: "",
    passportNumber: "", agreeTerms: false, emailVerified: false,
    region: "", levelId: "", levelName: "", examId: null,
    selectedDate: "", selectedTime: "", examAmount: "", paymentMethod: "",
  })

  const handleDataChange = (data: Partial<FormData>) =>
    setFormData(prev => ({ ...prev, ...data }))

  const handleStepClick = (targetStep: number) => {
    if (step === 4) return                          // Success screen — no going back
    if (targetStep >= step) return                  // Can't skip ahead
    if (targetStep === 3 && !registrationId) return // Step 3 needs a registration
    setStep(targetStep)
  }

  const steps = stepLabels[activeLang] ?? stepLabels.en
  const hl = headerLabels[activeLang] ?? headerLabels.en

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${activeLang}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            <ChevronLeft size={18} /> {hl.back}
          </Link>
          <h1 className="text-lg font-bold text-slate-900">{hl.title}</h1>
          <div className="flex items-center gap-1">
            {LANGUAGES.map((opt) => (
              <button
                key={opt.code}
                type="button"
                title={opt.name}
                onClick={() => setActiveLang(opt.code)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  activeLang === opt.code
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Image src={opt.flag} alt={opt.name} width={18} height={13} style={{ height: "auto" }} className="rounded-sm object-cover" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-slate-200 py-5 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center">
            {steps.map((label, i) => {
              const n = i + 1
              const isCompleted = n < step
              const isActive = n === step
              const isClickable = step < 4 && n < step && !(n === 3 && !registrationId)
              return (
                <div key={n} className="flex items-center flex-1">
                  <div
                    className={`flex flex-col items-center gap-1 ${isClickable ? "cursor-pointer group" : ""}`}
                    onClick={() => handleStepClick(n)}
                    title={isClickable ? label : undefined}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isCompleted
                        ? isClickable
                          ? "bg-primary text-white group-hover:bg-primary/80 ring-2 ring-transparent group-hover:ring-primary/30"
                          : "bg-primary text-white"
                        : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-slate-100 text-slate-400"
                    }`}>
                      {isCompleted ? <Check size={16} /> : n}
                    </div>
                    <span className={`hidden sm:block text-xs font-medium transition-colors ${
                      isActive ? "text-primary" :
                      isCompleted ? isClickable ? "text-slate-600 group-hover:text-primary" : "text-slate-600" :
                      "text-slate-400"
                    }`}>
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${isCompleted ? "bg-primary" : "bg-slate-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto max-w-2xl px-4 py-10">
        {step === 1 && (
          <StepPersonalInfo data={formData} lang={activeLang}
            onDataChange={handleDataChange} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepExamSelection data={formData} lang={activeLang}
            existingRegistrationId={registrationId}
            onDataChange={handleDataChange}
            onNext={() => setStep(3)}
            onPrevious={() => setStep(1)}
            onRegistrationComplete={(id) => { setRegistrationId(id); setStep(3) }} />
        )}
        {step === 3 && registrationId && (
          <StepPayment
            registrationId={registrationId}
            amount={formData.examAmount || "0"}
            lang={activeLang}
            onPaymentComplete={() => setStep(4)}
            onPrevious={() => setStep(2)} />
        )}
        {step === 4 && registrationId && (
          <SuccessScreen registrationId={registrationId} formData={formData} lang={activeLang} />
        )}
      </div>
    </div>
  )
}
