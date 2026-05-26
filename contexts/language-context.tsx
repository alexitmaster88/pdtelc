"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

type Language = "de" | "uz" | "en" | "ru"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  detectedLanguage: Language | null
  getLanguagePath: (path: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
  initialLanguage?: Language
}

function detectBrowserLanguage(): Language {
  const defaultLang: Language = "uz"
  const supportedLanguages: Language[] = ["de", "uz", "en", "ru"]
  try {
    const browserLanguages = navigator.languages || [navigator.language]
    for (const browserLang of browserLanguages) {
      const baseLang = browserLang.split("-")[0].toLowerCase()
      if (supportedLanguages.includes(baseLang as Language)) {
        return baseLang as Language
      }
    }
    return defaultLang
  } catch {
    return defaultLang
  }
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage || "uz")
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})
  const [detectedLanguage, setDetectedLanguage] = useState<Language | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const supportedLanguages: Language[] = ["de", "uz", "en", "ru"]

  const getLanguageFromPath = (path: string): Language | null => {
    const segments = path.split("/").filter(Boolean)
    if (segments.length > 0 && supportedLanguages.includes(segments[0] as Language)) {
      return segments[0] as Language
    }
    return null
  }

  const getPathWithoutLanguage = (path: string): string => {
    const segments = path.split("/").filter(Boolean)
    if (segments.length > 0 && supportedLanguages.includes(segments[0] as Language)) {
      return "/" + segments.slice(1).join("/")
    }
    return path
  }

  const getLanguagePath = (path: string): string => {
    const pathWithoutLang = getPathWithoutLanguage(path)
    return `/${language}${pathWithoutLang === "/" ? "" : pathWithoutLang}`
  }

  useEffect(() => {
    if (!pathname) return
    const pathLang = getLanguageFromPath(pathname)
    if (pathLang && pathLang !== language) {
      setLanguageState(pathLang)
      document.documentElement.lang = pathLang
    }
    setDetectedLanguage(detectBrowserLanguage())
    import("@/translations").then((module) => {
      const normalized = Object.fromEntries(
        Object.entries(module.default).map(([lang, map]) => [
          lang,
          Object.fromEntries(
            Object.entries(map).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v])
          )
        ])
      ) as Record<string, Record<string, string>>
      setTranslations(normalized)
    })
    if (initialLanguage) {
      document.documentElement.lang = initialLanguage
    }
  }, [initialLanguage])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("preferredLanguage", lang)
    document.documentElement.lang = lang
    document.cookie = `preferredLanguage=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`

    const currentPath = pathname || "/"
    const newPath = `/${lang}${getPathWithoutLanguage(currentPath) === "/" ? "" : getPathWithoutLanguage(currentPath)}`

    try {
      const scrollState = { path: currentPath, y: window.scrollY || 0 }
      sessionStorage.setItem("lang-switch-scroll", JSON.stringify(scrollState))
    } catch {
      // ignore
    }

    if (currentPath !== newPath) {
      router.push(newPath)
    }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lang-switch-scroll")
      if (!raw) return
      const { y } = JSON.parse(raw)
      requestAnimationFrame(() => { window.scrollTo({ top: y || 0 }) })
      sessionStorage.removeItem("lang-switch-scroll")
    } catch {
      // ignore
    }
  }, [])

  const t = (key: string): string => {
    const langTrans = translations[language]
    const deTrans = translations["de"]
    return langTrans?.[key] ?? deTrans?.[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detectedLanguage, getLanguagePath }}>
      {children}
    </LanguageContext.Provider>
  )
}
