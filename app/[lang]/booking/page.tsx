"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"

interface TelcBookingPageProps {
  params: { lang: string }
}

const regionLabels: Record<string, Record<string, string>> = {
  en: { tashkent: "Tashkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kashkadarya", bukhara: "Bukhara", urgench: "Urgench" },
  de: { tashkent: "Taschkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kaschkadarya", bukhara: "Buchara", urgench: "Urgentsch" },
  ru: { tashkent: "Ташкент", samarkand: "Самарканд", fergana: "Фергана", kashkadarya: "Кашкадарья", bukhara: "Бухара", urgench: "Ургенч" },
  uz: { tashkent: "Toshkent", samarkand: "Samarqand", fergana: "Farg'ona", kashkadarya: "Qashqadaryo", bukhara: "Buxoro", urgench: "Urganch" },
}

const getRegionLabel = (region: string, lang: string) => {
  const map = regionLabels[lang] ?? regionLabels.en
  return map[region] ?? (region.charAt(0).toUpperCase() + region.slice(1))
}

const examOptions = [
  { value: "A1", titleKey: "telc_booking_exam_a1", descriptionKey: "telc_booking_exam_desc_a1" },
  { value: "A2", titleKey: "telc_booking_exam_a2", descriptionKey: "telc_booking_exam_desc_a2" },
  { value: "B1", titleKey: "telc_booking_exam_b1", descriptionKey: "telc_booking_exam_desc_b1" },
  { value: "B2", titleKey: "telc_booking_exam_b2", descriptionKey: "telc_booking_exam_desc_b2" },
]

const LANGUAGES = [
  { code: "de", label: "DE", name: "Deutsch", flag: "/images/flag-de.png" },
  { code: "en", label: "EN", name: "English", flag: "/images/flag-en.png" },
  { code: "ru", label: "RU", name: "Русский", flag: "/images/flag-ru.png" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "/images/flag-uz.png" },
]

const cityCards = [
  { value: "tashkent", image: "/images/cities/tashkent.jpg", address: "14 Amir Temur Avenue, Tashkent" },
  { value: "samarkand", image: "/images/cities/samarkand.jpg", address: "8 Registan Street, Samarkand" },
  { value: "fergana", image: "/images/cities/fergana.jpg", address: "22 Yoshlik Road, Fergana" },
  { value: "qarshi", image: "/images/cities/karshi.jpg", address: "5 Mustaqillik Boulevard, Qarshi" },
  { value: "nukus", image: "/images/cities/nukus.jpg", address: "10 Mustakillik Street, Nukus" },
]

const courseEmails = [
  { value: "tashkent", email: "telc.tashkent@profi-deutsch.uz" },
  { value: "samarkand", email: "telc.samarkand@profi-deutsch.uz" },
  { value: "fergana", email: "telc.fergana@profi-deutsch.uz" },
  { value: "qarshi", email: "telc.karshi@profi-deutsch.uz" },
  { value: "nukus", email: "telc.nukus@profi-deutsch.uz" },
]

const faqItems = [
  { value: "q1", questionKey: "telc_faq_q_1", answerKey: "telc_faq_a_1" },
  { value: "q2", questionKey: "telc_faq_q_2", answerKey: "telc_faq_a_2" },
  { value: "q3", questionKey: "telc_faq_q_3", answerKey: "telc_faq_a_3" },
  { value: "q4", questionKey: "telc_faq_q_4", answerKey: "telc_faq_a_4" },
]

export default function TelcBookingPage({ params }: TelcBookingPageProps) {
  const paramsData = React.use(params as unknown as React.Usable<TelcBookingPageProps["params"]>) as TelcBookingPageProps["params"]
  const { lang } = paramsData
  const { language, t, setLanguage, getLanguagePath } = useLanguage()
  const [selectedCity, setSelectedCity] = React.useState("")
  const [selectedLevel, setSelectedLevel] = React.useState("")
  const [regions, setRegions] = React.useState<string[]>([])
  const [levels, setLevels] = React.useState<{ id: number; level: string }[]>([])

  React.useEffect(() => {
    if (lang && lang !== language) {
      setLanguage(lang as "de" | "en" | "ru" | "uz")
    }
  }, [lang, language, setLanguage])

  React.useEffect(() => {
    fetch("/api/telc/exams")
      .then(r => r.json())
      .then((exams: any[]) => {
        const unique = Array.from(new Set(exams.map((e: any) => e.region).filter(Boolean))).sort() as string[]
        setRegions(unique)
        if (unique.length > 0) setSelectedCity(prev => prev || unique[0])
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    fetch("/api/telc/exam-levels")
      .then(r => r.json())
      .then((data: any[]) => {
        setLevels(data)
        if (data.length > 0) setSelectedLevel(prev => prev || data[0].level)
      })
      .catch(() => {})
  }, [])

  const backUrl = getLanguagePath("/")
  const contactUrl = "https://profi-deutsch.uz"

  return (
    <main className="bg-transparent text-slate-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(12,2,163,0.14),_transparent_42%),linear-gradient(180deg,#eef2ff_0%,#ffffff_55%,#f8fafc_100%)] py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 xl:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 font-semibold text-primary">
                  {t("telc")}
                </span>
                <Link href={backUrl} className="transition-colors hover:text-primary">
                  ← {t("telc_back_to_registration")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm">
                {LANGUAGES.map((option) => (
                  <Link
                    key={option.code}
                    href={`/${option.code}/booking`}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      language === option.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Image src={option.flag} alt={`${option.name} flag`} width={20} height={14} className="rounded-sm object-cover" />
                    <span>{option.label}</span>
                  </Link>
                ))}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
                  {t("telc_booking_title")}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  {t("telc_booking_subtitle")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_booking_location_label")}</p>
                  <p className="mt-3 text-base leading-7 text-slate-600">{t("telc_booking_description")}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_booking_level_label")}</p>
                  <ul className="mt-4 space-y-3 text-slate-600">
                    {levels.map((lv) => (
                      <li key={lv.id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {lv.level}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/70 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/30">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_booking_location_label")}</p>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-950">{t("telc_booking_submit")}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{t("telc_booking_note")}</p>
                </div>

                <form id="booking-form" className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="city">
                      {t("telc_booking_location_label")}
                    </label>
                    <select
                      id="city"
                      value={selectedCity}
                      onChange={(event) => setSelectedCity(event.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {getRegionLabel(region, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="level">
                      {t("telc_booking_level_label")}
                    </label>
                    <select
                      id="level"
                      value={selectedLevel}
                      onChange={(event) => setSelectedLevel(event.target.value)}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      {levels.map((lv) => (
                        <option key={lv.id} value={lv.level}>
                          {lv.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button asChild size="lg" className="w-full">
                    <Link href={`/${lang}/register`}>
                      {t("telc_booking_submit")}
                    </Link>
                  </Button>
                </form>

                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                  <p>{t("telc_booking_note")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_booking_exam_section_title")}</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-950">{t("telc_booking_exam_section_subtitle")}</h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              {t("telc_booking_exam_levels_range")}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {examOptions.map((option) => (
            <article key={option.value} className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {option.value}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{t(option.titleKey)}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{t(option.descriptionKey)}</p>
              <ul className="mt-6 space-y-3 text-slate-600">
                {[
                  "telc_booking_feature_official",
                  "telc_booking_feature_support",
                  "telc_booking_feature_personalized",
                  "telc_booking_feature_fast_confirmation",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 text-primary" />
                    <span>{t(feature)}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-8 w-full">
                <a href="#booking-form">{t("telc_booking_submit")}</a>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-white/85 backdrop-blur-xl p-10 shadow-xl shadow-slate-200/30">
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="grid grid-cols-3 gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-1">
              <TabsTrigger value="information" className="rounded-3xl px-4 py-3 text-sm font-semibold">{t("telc_booking_tab_information")}</TabsTrigger>
              <TabsTrigger value="preparation" className="rounded-3xl px-4 py-3 text-sm font-semibold">{t("telc_booking_tab_preparation")}</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-3xl px-4 py-3 text-sm font-semibold">{t("telc_booking_tab_faq")}</TabsTrigger>
            </TabsList>

            <TabsContent value="information" className="mt-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">{t("telc_booking_info_b1_b2_title")}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{t("telc_booking_info_b1_b2_text")}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-950">{t("telc_booking_info_exam_structure_title")}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{t("telc_booking_info_exam_structure_intro")}</p>
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h4 className="text-xl font-semibold text-slate-950">{t("telc_booking_info_written_title")}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{t("telc_booking_info_written_overview")}</p>
                      <ul className="mt-4 space-y-3 text-slate-600">
                        <li>{t("telc_booking_info_written_listening")}</li>
                        <li>{t("telc_booking_info_written_reading")}</li>
                        <li>{t("telc_booking_info_written_writing")}</li>
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h4 className="text-xl font-semibold text-slate-950">{t("telc_booking_info_oral_title")}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{t("telc_booking_info_oral_overview")}</p>
                      <ul className="mt-4 space-y-3 text-slate-600">
                        <li>{t("telc_booking_info_oral_preparation")}</li>
                        <li>{t("telc_booking_info_oral_exam")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preparation" className="mt-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-slate-950">{t("telc_booking_preparatory_course_title")}</h3>
                <p className="mt-4 text-base leading-8 text-slate-600">{t("telc_booking_preparatory_course_text")}</p>
                <p className="mt-4 text-base leading-8 text-slate-600">{t("telc_booking_preparatory_course_question")}</p>
                <ul className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                  {[
                    "telc_booking_preparation_bullet_1","telc_booking_preparation_bullet_2",
                    "telc_booking_preparation_bullet_3","telc_booking_preparation_bullet_4",
                    "telc_booking_preparation_bullet_5","telc_booking_preparation_bullet_6",
                    "telc_booking_preparation_bullet_7",
                  ].map((bullet) => (
                    <li key={bullet} className="list-disc pl-4 text-sm leading-7">{t(bullet)}</li>
                  ))}
                </ul>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-base leading-8 text-slate-600">{t("telc_booking_preparatory_course_contact_prompt")}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {courseEmails.map((item) => (
                      <div key={item.value} className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="font-semibold text-slate-950">{t(`telc_booking_city_${item.value}`)}</p>
                        <a href={`mailto:${item.email}`} className="mt-2 block text-sm text-primary underline">{item.email}</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="mt-8">
              <div className="space-y-6">
                <p className="text-base leading-8 text-slate-600">{t("telc_booking_faq_intro")}</p>
                <p className="text-base leading-8 text-slate-600">
                  {t("telc_booking_faq_link_text")}{" "}
                  <a href="https://t.me/profi_deutsch_uz" target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
                    {t("telc_booking_faq_link_label")}
                  </a>{" "}
                  {t("telc_booking_faq_link_followup")}
                </p>
                <p className="text-base leading-8 text-slate-600">{t("telc_booking_faq_support_text")}</p>
                <div className="space-y-4">
                  {faqItems.map((item) => (
                    <div key={item.value} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h4 className="text-lg font-semibold text-slate-950">{t(item.questionKey)}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{t(item.answerKey)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("telc_booking_cities_title")}</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-950">{t("telc_booking_cities_description")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cityCards.map((city) => (
            <article key={city.value} className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-36 overflow-hidden bg-slate-100">
                <img src={city.image} alt={t(`telc_booking_city_${city.value}`)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white">{t("telc_booking_city_support_badge")}</p>
                </div>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-950">{t(`telc_booking_city_${city.value}`)}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{t("telc_booking_city_badge")}</span>
                </div>
                <p className="text-sm leading-5 text-slate-600">{t("telc_booking_city_description")}</p>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{t("address")}</p>
                  <p className="mt-1 font-semibold text-slate-950">{city.address}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-secondary/10 p-10 shadow-xl shadow-slate-200">
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
