"use client"

import { useState, useEffect } from "react"
import { Loader2, QrCode, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  registrationId: number
  amount: string | number
  lang: string
  onPaymentComplete: () => void
  onPrevious: () => void
}

const ui: Record<string, Record<string, string>> = {
  en: { title: "Payment", amount: "Amount", selectMethod: "Select Payment Method", click: "Click", payme: "Payme", other: "Other", scanQr: "Scan QR Code", instructions: "Payment Instructions", step1: "Scan the QR code with your mobile device", step2: "Enter the amount and complete the payment", step3: 'Click "Verify Payment" below to confirm', verifyBtn: "Verify Payment", verifying: "Verifying...", verified: "Payment Verified", verifiedMsg: "Your payment has been successfully processed.", previous: "← Previous", submit: "Continue →", errMethod: "Please select a payment method", errFail: "Payment verification failed. Please try again." },
  de: { title: "Zahlung", amount: "Betrag", selectMethod: "Zahlungsmethode wählen", click: "Click", payme: "Payme", other: "Sonstige", scanQr: "QR-Code scannen", instructions: "Zahlungsanleitung", step1: "QR-Code mit dem Handy scannen", step2: "Betrag eingeben und Zahlung abschließen", step3: '"Zahlung prüfen" klicken', verifyBtn: "Zahlung prüfen", verifying: "Wird geprüft...", verified: "Zahlung bestätigt", verifiedMsg: "Ihre Zahlung wurde erfolgreich verarbeitet.", previous: "← Zurück", submit: "Weiter →", errMethod: "Bitte Zahlungsmethode wählen", errFail: "Zahlungsprüfung fehlgeschlagen." },
  ru: { title: "Оплата", amount: "Сумма", selectMethod: "Выберите способ оплаты", click: "Click", payme: "Payme", other: "Другой", scanQr: "Сканируйте QR-код", instructions: "Инструкция", step1: "Отсканируйте QR-код телефоном", step2: "Введите сумму и завершите оплату", step3: 'Нажмите "Подтвердить оплату"', verifyBtn: "Подтвердить оплату", verifying: "Проверка...", verified: "Оплата подтверждена", verifiedMsg: "Ваша оплата успешно обработана.", previous: "← Назад", submit: "Продолжить →", errMethod: "Выберите способ оплаты", errFail: "Ошибка подтверждения оплаты." },
  uz: { title: "To'lov", amount: "Summa", selectMethod: "To'lov usulini tanlang", click: "Click", payme: "Payme", other: "Boshqa", scanQr: "QR kodni skanerlang", instructions: "To'lov ko'rsatmalari", step1: "Telefon bilan QR kodni skanerlang", step2: "Summani kiriting va to'lovni yakunlang", step3: '"To\'lovni tasdiqlash" tugmasini bosing', verifyBtn: "To'lovni tasdiqlash", verifying: "Tekshirilmoqda...", verified: "To'lov tasdiqlandi", verifiedMsg: "To'lovingiz muvaffaqiyatli amalga oshirildi.", previous: "← Oldingi", submit: "Davom etish →", errMethod: "To'lov usulini tanlang", errFail: "To'lovni tasdiqlashda xato." },
}

const METHODS = [
  { id: "click", icon: "💳", colorSelected: "border-blue-400 bg-blue-50", colorBase: "border-slate-200 hover:border-blue-300" },
  { id: "payme", icon: "📱", colorSelected: "border-purple-400 bg-purple-50", colorBase: "border-slate-200 hover:border-purple-300" },
  { id: "other", icon: "🏦", colorSelected: "border-green-400 bg-green-50", colorBase: "border-slate-200 hover:border-green-300" },
]

export default function StepPayment({ registrationId, amount, lang, onPaymentComplete, onPrevious }: Props) {
  const l = ui[lang] ?? ui.en
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [paymentId, setPaymentId] = useState<number | null>(null)

  const paymeMerchantId = process.env.NEXT_PUBLIC_PAYME_MERCHANT_ID ?? ""
  const paymeAmountTiyin = String(Math.round(Number(amount) * 100))
  const paymeLang = lang === "de" ? "ru" : (["ru", "uz", "en"].includes(lang) ? lang : "ru")
  // Use sandbox checkout when NEXT_PUBLIC_PAYME_ENV=test, production otherwise
  const paymeCheckoutUrl = process.env.NEXT_PUBLIC_PAYME_ENV === "test"
    ? "https://test.paycom.uz"
    : "https://checkout.paycom.uz"

  useEffect(() => {
    if (selectedMethod !== "payme" || !paymeMerchantId) return
    let cancelled = false

    const init = () => {
      if (cancelled) return
      try { (window as any).Paycom?.QR("#payme-form", "#payme-qr-container") } catch {}
      try { (window as any).Paycom?.Button("#payme-form", "#payme-btn-container") } catch {}
    }

    if ((window as any).Paycom) { init(); return }

    const existing = document.getElementById("paycom-script") as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", init)
      return () => { cancelled = true; existing.removeEventListener("load", init) }
    }

    const script = document.createElement("script")
    script.id = "paycom-script"
    script.src = "https://cdn.paycom.uz/integration/js/checkout.min.js"
    script.onload = init
    document.head.appendChild(script)
    return () => { cancelled = true }
  }, [selectedMethod, paymeMerchantId, registrationId])

  const handleVerify = async () => {
    if (!selectedMethod) { toast.error(l.errMethod); return }
    setIsVerifying(true)
    try {
      // Create payment record
      const createRes = await fetch("/api/telc/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, amount: String(amount), paymentMethod: selectedMethod }),
      })
      if (!createRes.ok) throw new Error()
      const payment = await createRes.json()

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 2000))

      // Verify payment
      const verifyRes = await fetch("/api/telc/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id, registrationId }),
      })
      if (!verifyRes.ok) throw new Error()

      setPaymentId(payment.id)
      setPaymentVerified(true)
      toast.success(l.verified)
      setTimeout(onPaymentComplete, 1500)
    } catch {
      toast.error(l.errFail)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{l.title}</h2>

      {/* Amount */}
      <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
        <p className="text-sm text-slate-600 mb-1">{l.amount}</p>
        <p className="text-4xl font-bold text-primary">
          {Number(amount).toLocaleString()} <span className="text-2xl">UZS</span>
        </p>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-4">{l.selectMethod}<span className="text-red-500 ml-0.5">*</span></h3>
        <div className="grid grid-cols-3 gap-4">
          {METHODS.map(m => (
            <button key={m.id} type="button"
              onClick={() => setSelectedMethod(m.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${selectedMethod === m.id ? m.colorSelected : m.colorBase}`}>
              <span className="text-3xl">{m.icon}</span>
              <span className="text-sm font-semibold text-slate-900">{l[m.id as keyof typeof l]}</span>
              <div className="mt-1 w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                <QrCode size={36} className="text-slate-400" />
              </div>
              {selectedMethod === m.id && (
                <span className="text-xs font-semibold text-primary flex items-center gap-1">
                  <Check size={12} /> Selected
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payme hidden form (must live outside any button) */}
      {selectedMethod === "payme" && paymeMerchantId && (
        <form id="payme-form" action={`${paymeCheckoutUrl}/`} method="POST" style={{ display: "none" }}>
          <input type="hidden" name="merchant" value={paymeMerchantId} />
          <input type="hidden" name="amount" value={paymeAmountTiyin} />
          <input type="hidden" name="account[order_id]" value={String(registrationId)} />
          <input type="hidden" name="lang" value={paymeLang} />
          <input type="hidden" name="description" value={`TELC exam registration #${registrationId}`} />
        </form>
      )}

      {/* Instructions / Payme QR */}
      {selectedMethod && !paymentVerified && (
        <div className="mb-6">
          {selectedMethod === "payme" && paymeMerchantId ? (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-purple-900">{l.scanQr}</p>
              <div id="payme-qr-container" className="flex justify-center min-h-[120px] items-center" />
              <div id="payme-btn-container" className="flex justify-center" />
            </div>
          ) : (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <h4 className="font-semibold text-blue-900 mb-3">{l.instructions}</h4>
              <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                <li>{l.step1}</li>
                <li>{l.step2}</li>
                <li>{l.step3}</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Verified state */}
      {paymentVerified && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-5">
          <Check size={24} className="text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-900">{l.verified}</p>
            <p className="text-sm text-green-800">{l.verifiedMsg}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" size="lg" className="flex-1"
          disabled={isVerifying || paymentVerified} onClick={onPrevious}>
          {l.previous}
        </Button>
        {!paymentVerified ? (
          <Button type="button" size="lg" className="flex-1"
            disabled={!selectedMethod || isVerifying} onClick={handleVerify}>
            {isVerifying && <Loader2 size={16} className="animate-spin mr-2" />}
            {isVerifying ? l.verifying : l.verifyBtn}
          </Button>
        ) : (
          <Button type="button" size="lg" className="flex-1" onClick={onPaymentComplete}>
            {l.submit}
          </Button>
        )}
      </div>
    </div>
  )
}
