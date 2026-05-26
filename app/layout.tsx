import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

export const metadata: Metadata = {
  title: "PD TELC — Offizielle TELC-Prüfungsanmeldung in Usbekistan",
  description: "Registrieren Sie sich für TELC-Prüfungen in Usbekistan. Sichere Online-Anmeldung mit Payme und Paynet.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={GeistSans.className}>
        {children}
      </body>
    </html>
  )
}
