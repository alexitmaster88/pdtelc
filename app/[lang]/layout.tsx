"use client"

import { LanguageProvider } from "@/contexts/language-context"

const LANGS = ["de", "uz", "en", "ru"]

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const lang = LANGS.includes(params.lang) ? params.lang : "uz"
  return (
    <LanguageProvider initialLanguage={lang as "de" | "uz" | "en" | "ru"}>
      {children}
    </LanguageProvider>
  )
}
