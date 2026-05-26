"use client"

import { useLanguage } from "@/contexts/language-context"
import type { LanguageContent } from "@/utils/language-content"

// Types for social media content
export interface SocialMediaPost {
  id: string
  platform: "facebook" | "instagram" | "twitter" | "linkedin"
  author: {
    name: string
    handle: string
    avatar: string
  }
  content: string
  image?: string
  likes: number
  comments: number
  shares?: number
  date: string
  url: string
}

export interface Review {
  id: string
  platform: "google" | "facebook" | "trustpilot" | "yelp"
  author: {
    name: string
    avatar?: string
    location?: string
  }
  rating: number
  content: string
  date: string
  language: string
  helpful?: number
  response?: {
    author: string
    content: string
    date: string
  }
}

// Hook to get social media posts for the current language
export function useSocialMediaPosts(posts: LanguageContent<SocialMediaPost[]>): SocialMediaPost[] {
  const { language } = useLanguage()
  return posts[language]
}

// Hook to get reviews for the current language
export function useReviews(reviews: LanguageContent<Review[]>): Review[] {
  const { language } = useLanguage()
  return reviews[language]
}

// Function to format date based on language
export function formatDate(dateString: string, language: "de" | "en" | "ru" | "uz"): string {
  const date = new Date(dateString)

  switch (language) {
    case "de":
      return date.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })
    case "en":
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    case "ru":
      return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" })
    case "uz":
      return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })
    default:
      return date.toLocaleDateString()
  }
}

// Function to get platform icon
export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case "facebook":
      return "facebook"
    case "instagram":
      return "instagram"
    case "twitter":
      return "twitter"
    case "linkedin":
      return "linkedin"
    case "google":
      return "google"
    case "trustpilot":
      return "trustpilot"
    case "yelp":
      return "yelp"
    default:
      return "globe"
  }
}
