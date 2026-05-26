"use client"

import { useLanguage } from "@/contexts/language-context"

// Type for language-specific image paths
export type LanguageSpecificImages = {
  de: string
  en: string
  ru: string
  uz: string
}

// Hook to get the appropriate image for the current language
export function useLanguageImage(images: LanguageSpecificImages): string {
  const { language } = useLanguage()
  return images[language]
}

// Function to get culturally appropriate alt text
export function getLocalizedAltText(altTexts: LanguageSpecificImages, language: "de" | "en" | "ru" | "uz"): string {
  return altTexts[language]
}
