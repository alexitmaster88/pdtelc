"use client"

import type { ReactNode } from "react"
import { useLanguage } from "@/contexts/language-context"

// Type for language-specific content
export type LanguageContent<T> = {
  de: T
  en: T
  ru: T
  uz: T
}

// Hook to get content for the current language
export function useLanguageContent<T>(content: LanguageContent<T>): T {
  const { language } = useLanguage()
  return content[language]
}

// Component to render language-specific content
export function LanguageSpecificContent({
  content,
}: {
  content: LanguageContent<ReactNode>
}): ReactNode | null {
  const { language } = useLanguage()
  return content[language] ?? null
}
