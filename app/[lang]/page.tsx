"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ClipboardList, CreditCard, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface TelcPageProps {
  params: {
    lang: string
  }
}

const LANGUAGES = [
  { code: "de", label: "DE", name: "Deutsch", flag: "/images/flag-de.png" },
  { code: "en", label: "EN", name: "English", flag: "/images/flag-en.png" },
  { code: "ru", label: "RU", name: "Русский", flag: "/images/flag-ru.png" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "/images/flag-uz.png" },
]

const faqItems = [
  { value: "q1", questionKey: "telc_faq_q_1", answerKey: "telc_faq_a_1" },
  { value: "q2", questionKey: "telc_faq_q_2", answerKey: "telc_faq_a_2" },
  { value: "q3", questionKey: "telc_faq_q_3", answerKey: "telc_faq_a_3" },
  { value: "q4", questionKey: "telc_faq_q_4", answerKey: "telc_faq_a_4" },
]

export default function TelcPage({ params }: TelcPageProps) {
  const paramsData = React.use(params as unknown as React.Usable<TelcPageProps["params"]>) as TelcPageProps["params"]
  const { lang } = paramsData
  const { language, t, setLanguage, getLanguagePath } = useLanguage()

  React.useEffect(() => {
    if (lang && lang !== language) {
      setLanguage(lang as "de" | "en" | "ru" | "uz")
    }
  }, [lang, language, setLanguage])

  const bookingUrl = getLanguagePath("/booking")
  const contactUrl = "https://profi-deutsch.uz"

  return (
    <main className="bg-transparent text-slate-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(12,2,163,0.12),_transparent_45%),linear-gradient(180deg,#eef2ff_0%,#ffffff_50%,#f8fafc_100%)] py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                  {t("telc")}
                </span>
                <a href="https://profi-deutsch.uz" className="text-sm font-medium text-slate-700 transition-colors hover:text-primary">
                  ← {t("telc_back_to_home")}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                {LANGUAGES.map((option) => (
                  <Link
                    key={option.code}
                    href={`/${option.code}`}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      language === option.code ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Image src={option.flag} alt={`${option.name} flag`} width={20} height={14} className="rounded-sm object-cover" />
                    <span>{option.label}</span>
                  </Link>
                ))}
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                {t("telc_page_title")}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {t("telc_page_subtitle")}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={bookingUrl}>
                    {t("telc_cta")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={contactUrl} target="_blank" rel="noreferrer">{t("telc_need_help_cta")}</a>
                </Button>
              </div>

              <div className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("telc_page_info_label")}</p>
                <p className="mt-3 text-base leading-7 text-slate-600">{t("telc_page_info_text")}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/30">
              <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-br from-[#6577c2] via-[#c1bfff] to-slate-800 p-6 text-white shadow-lg">
                  <p className="text-sm uppercase tracking-[0.3em] text-white">{t("telc_page_ticket_label")}</p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">{t("telc_page_ticket_title")}</h2>
                  <p className="mt-4 text-sm leading-6 text-white">{t("telc_page_ticket_subtitle")}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: t("telc_page_stat_1_title"), value: t("telc_page_stat_1_value") },
                    { title: t("telc_page_stat_2_title"), value: t("telc_page_stat_2_value") },
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.title}</p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
          {[
            { icon: <ClipboardList className="h-6 w-6 text-primary" />, title: t("telc_feature_easy_title"), desc: t("telc_feature_easy_desc") },
            { icon: <CreditCard className="h-6 w-6 text-primary" />, title: t("telc_feature_secure_title"), desc: t("telc_feature_secure_desc") },
            { icon: <Award className="h-6 w-6 text-primary" />, title: t("telc_feature_cert_title"), desc: t("telc_feature_cert_desc") },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white/80 backdrop-blur-xl p-8 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-xl p-10 shadow-xl shadow-slate-200/30">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t("telc_page_ticket_label")}</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">{t("telc_page_ticket_title")}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{t("telc_page_ticket_subtitle")}</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: t("telc_page_level_a1_a2"), subtitle: t("telc_page_level_a1_a2_description"), price: "250 000 UZS" },
              { title: t("telc_page_level_a2_b1"), subtitle: t("telc_page_level_a2_b1_description"), price: "300 000 UZS" },
              { title: t("telc_page_level_b1"), subtitle: t("telc_page_level_b1_description"), price: "350 000 UZS" },
              { title: t("telc_page_level_b2"), subtitle: t("telc_page_level_b2_description"), price: "400 000 UZS" },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.subtitle}</p>
                </div>
                <div className="mt-auto space-y-3">
                  <p className="text-2xl font-bold text-slate-950">{item.price}</p>
                  <Button asChild size="sm" className="w-full">
                    <Link href={bookingUrl}>{t("telc_register_for_exam")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-white/80 backdrop-blur-xl p-10 shadow-xl shadow-slate-200/30">
          <div className="grid gap-10 lg:grid-cols-3">
            {[
              { title: t("telc_step_1_title"), description: t("telc_step_1_description") },
              { title: t("telc_step_2_title"), description: t("telc_step_2_description") },
              { title: t("telc_step_3_title"), description: t("telc_step_3_description") },
            ].map((step, index) => (
              <article key={step.title} className="rounded-3xl border border-slate-200 p-8 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_faq_section_label")}</p>
                <h2 className="text-3xl font-bold text-slate-950">{t("telc_faq_title")}</h2>
                <p className="max-w-2xl text-base leading-8 text-slate-600">{t("telc_faq_description")}</p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <Accordion type="single" collapsible defaultValue="q1">
                  {faqItems.map((item) => (
                    <AccordionItem key={item.value} value={item.value}>
                      <AccordionTrigger>{t(item.questionKey)}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm leading-7 text-slate-600">{t(item.answerKey)}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-10 shadow-xl shadow-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_need_help_label")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{t("telc_need_help_title")}</h2>
            </div>
            <Button asChild size="lg">
              <a href={contactUrl} target="_blank" rel="noreferrer">{t("telc_need_help_cta")}</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
