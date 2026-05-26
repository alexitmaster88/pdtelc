const translations = {
  uz: {
    header: { logo: "Profi Deutsch", selectLanguage: "Tilni tanlang" },
    hero: {
      title: "O'zbekistondagi telc imtihonining rasmiy ro'yxatdan o'tish platformasiga xush kelibsiz",
      subtitle: "Nemis tilini o'rgangan talabalar uchun xalqaro sertifikat",
      cta: "Imtihonga ro'yxatdan o'tish",
    },
    examLevels: { title: "Imtihon Darajalari", subtitle: "O'zingizga mos darajani tanlang", price: "Narxi", som: "so'm" },
    registration: {
      step1: "Shaxsiy ma'lumotlar", step2: "Imtihon tanlash", step3: "To'lov", success: "Muvaffaqiyatli",
      progressBar: "Qadam {{current}} / {{total}}",
    },
    step1: {
      title: "Shaxsiy ma'lumotlar", firstName: "Ism", lastName: "Familiya", phoneNumber: "Telefon raqami",
      email: "Email", passportNumber: "Passport raqami", agreeTerms: "Offerta shartlariga roziman",
      verifyEmail: "Emailni tasdiqlash", enterOtp: "OTP kodni kiriting", sendOtp: "OTP yuborish",
      verifyOtp: "OTP tasdiqlash", next: "Keyingi",
      errors: {
        firstNameRequired: "Ism kiritish majburiy", lastNameRequired: "Familiya kiritish majburiy",
        phoneRequired: "Telefon raqami kiritish majburiy", emailRequired: "Email kiritish majburiy",
        emailInvalid: "Email noto'g'ri formatda", passportRequired: "Passport raqami kiritish majburiy",
        termsRequired: "Shartlarga rozi bo'lish majburiy", otpRequired: "OTP kodi kiritish majburiy",
        otpInvalid: "OTP kodi noto'g'ri",
      },
    },
    step2: {
      title: "Imtihon tanlash", selectRegion: "Hududni tanlang", selectLevel: "Darajani tanlang",
      selectDate: "Sanani tanlang", selectTime: "Vaqtni tanlang", region: "Hudud", level: "Daraja",
      date: "Sana", time: "Vaqt", noExamsAvailable: "Tanlangan hudud va darajada imtihon mavjud emas",
      previous: "Oldingi", next: "Keyingi",
      regions: { tashkent: "Toshkent", samarkand: "Samarqand", fergana: "Farg'ona", kashkadarya: "Qashqadaryo", bukhara: "Buxoro", urgench: "Urganch" },
    },
    step3: {
      title: "To'lov", amount: "Summa", paymentMethod: "To'lov usuli", selectPaymentMethod: "To'lov usulini tanlang",
      click: "Click", payme: "Payme", other: "Boshqa", scanQr: "QR kodni skanerlang",
      manualVerification: "Qo'lda tasdiqlash", autoVerification: "Avtomatik tasdiqlash",
      verifyPayment: "To'lovni tasdiqlash", paymentPending: "To'lov kutilmoqda...",
      previous: "Oldingi", submit: "To'lovni yuborish",
    },
    success: {
      title: "Siz muvaffaqiyatli ro'yxatdan o'tdingiz!", confirmationDetails: "Tasdiqlash ma'lumotlari",
      name: "Ism va Familiya", region: "Hudud", date: "Sana", time: "Vaqt", level: "Daraja",
      reminders: "Eslatmalar", reminder1: "Imtihonga 30 daqiqa oldin keling",
      reminder2: "Passport (ID) olib keling", reminder3: "Kech qolganlar kiritilmaydi",
      downloadTicket: "Chiptani yuklab olish", backHome: "Bosh sahifaga qaytish",
    },
    common: { loading: "Yuklanmoqda...", error: "Xato yuz berdi", success: "Muvaffaqiyatli", cancel: "Bekor qilish", close: "Yopish", required: "Majburiy" },
  },
  en: {
    header: { logo: "Profi Deutsch", selectLanguage: "Select Language" },
    hero: {
      title: "Welcome to the official telc exam registration platform in Uzbekistan",
      subtitle: "International certification for German language learners",
      cta: "Register for Exam",
    },
    examLevels: { title: "Exam Levels", subtitle: "Choose the level that suits you", price: "Price", som: "UZS" },
    registration: {
      step1: "Personal Information", step2: "Exam Selection", step3: "Payment", success: "Success",
      progressBar: "Step {{current}} / {{total}}",
    },
    step1: {
      title: "Personal Information", firstName: "First Name", lastName: "Last Name", phoneNumber: "Phone Number",
      email: "Email", passportNumber: "Passport Number", agreeTerms: "I agree to the terms and conditions",
      verifyEmail: "Verify Email", enterOtp: "Enter OTP Code", sendOtp: "Send OTP", verifyOtp: "Verify OTP", next: "Next",
      errors: {
        firstNameRequired: "First name is required", lastNameRequired: "Last name is required",
        phoneRequired: "Phone number is required", emailRequired: "Email is required",
        emailInvalid: "Invalid email format", passportRequired: "Passport number is required",
        termsRequired: "You must agree to the terms", otpRequired: "OTP code is required",
        otpInvalid: "Invalid OTP code",
      },
    },
    step2: {
      title: "Exam Selection", selectRegion: "Select Region", selectLevel: "Select Level",
      selectDate: "Select Date", selectTime: "Select Time", region: "Region", level: "Level",
      date: "Date", time: "Time", noExamsAvailable: "No exams available for selected region and level",
      previous: "Previous", next: "Next",
      regions: { tashkent: "Tashkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kashkadarya", bukhara: "Bukhara", urgench: "Urgench" },
    },
    step3: {
      title: "Payment", amount: "Amount", paymentMethod: "Payment Method", selectPaymentMethod: "Select Payment Method",
      click: "Click", payme: "Payme", other: "Other", scanQr: "Scan QR Code",
      manualVerification: "Manual Verification", autoVerification: "Auto Verification",
      verifyPayment: "Verify Payment", paymentPending: "Payment pending...",
      previous: "Previous", submit: "Submit Payment",
    },
    success: {
      title: "You have successfully registered!", confirmationDetails: "Confirmation Details",
      name: "Full Name", region: "Region", date: "Date", time: "Time", level: "Level",
      reminders: "Reminders", reminder1: "Arrive 30 minutes before the exam",
      reminder2: "Bring your passport (ID)", reminder3: "Latecomers will not be admitted",
      downloadTicket: "Download Ticket", backHome: "Back to Home",
    },
    common: { loading: "Loading...", error: "An error occurred", success: "Success", cancel: "Cancel", close: "Close", required: "Required" },
  },
  de: {
    header: { logo: "Profi Deutsch", selectLanguage: "Sprache wählen" },
    hero: {
      title: "Willkommen zur offiziellen Anmeldeplattform für telc-Prüfungen in Usbekistan",
      subtitle: "Internationales Zertifikat für Deutschlernende",
      cta: "Zur Prüfung anmelden",
    },
    examLevels: { title: "Prüfungsstufen", subtitle: "Wählen Sie die Stufe, die zu Ihnen passt", price: "Preis", som: "UZS" },
    registration: {
      step1: "Persönliche Daten", step2: "Prüfung wählen", step3: "Zahlung", success: "Erfolg",
      progressBar: "Schritt {{current}} / {{total}}",
    },
    step1: {
      title: "Persönliche Daten", firstName: "Vorname", lastName: "Nachname", phoneNumber: "Telefonnummer",
      email: "E-Mail", passportNumber: "Passnummer", agreeTerms: "Ich stimme den Allgemeinen Geschäftsbedingungen zu",
      verifyEmail: "E-Mail verifizieren", enterOtp: "OTP-Code eingeben", sendOtp: "OTP senden",
      verifyOtp: "OTP verifizieren", next: "Weiter",
      errors: {
        firstNameRequired: "Vorname ist erforderlich", lastNameRequired: "Nachname ist erforderlich",
        phoneRequired: "Telefonnummer ist erforderlich", emailRequired: "E-Mail ist erforderlich",
        emailInvalid: "Ungültiges E-Mail-Format", passportRequired: "Passnummer ist erforderlich",
        termsRequired: "Sie müssen den Bedingungen zustimmen", otpRequired: "OTP-Code ist erforderlich",
        otpInvalid: "Ungültiger OTP-Code",
      },
    },
    step2: {
      title: "Prüfung wählen", selectRegion: "Region wählen", selectLevel: "Stufe wählen",
      selectDate: "Datum wählen", selectTime: "Zeit wählen", region: "Region", level: "Stufe",
      date: "Datum", time: "Zeit", noExamsAvailable: "Keine Prüfungen für die ausgewählte Region und Stufe verfügbar",
      previous: "Zurück", next: "Weiter",
      regions: { tashkent: "Taschkent", samarkand: "Samarkand", fergana: "Fergana", kashkadarya: "Kaschkadarya", bukhara: "Buchara", urgench: "Urgentsch" },
    },
    step3: {
      title: "Zahlung", amount: "Betrag", paymentMethod: "Zahlungsmethode", selectPaymentMethod: "Zahlungsmethode wählen",
      click: "Click", payme: "Payme", other: "Sonstige", scanQr: "QR-Code scannen",
      manualVerification: "Manuelle Überprüfung", autoVerification: "Automatische Überprüfung",
      verifyPayment: "Zahlung überprüfen", paymentPending: "Zahlung wird verarbeitet...",
      previous: "Zurück", submit: "Zahlung absenden",
    },
    success: {
      title: "Sie haben sich erfolgreich angemeldet!", confirmationDetails: "Bestätigungsdetails",
      name: "Vollständiger Name", region: "Region", date: "Datum", time: "Zeit", level: "Stufe",
      reminders: "Erinnerungen", reminder1: "Kommen Sie 30 Minuten vor der Prüfung an",
      reminder2: "Bringen Sie Ihren Pass (Ausweis) mit", reminder3: "Zu spät Kommende werden nicht zugelassen",
      downloadTicket: "Ticket herunterladen", backHome: "Zur Startseite",
    },
    common: { loading: "Wird geladen...", error: "Ein Fehler ist aufgetreten", success: "Erfolg", cancel: "Abbrechen", close: "Schließen", required: "Erforderlich" },
  },
}

type Translations = typeof translations
type Lang = keyof Translations

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : undefined
}

export function telcT(
  language: "uz" | "en" | "de" | "ru",
  key: string,
  variables?: Record<string, string | number>
): string {
  const lang: Lang = language === "ru" ? "en" : language
  let text =
    getNestedValue(translations[lang] as unknown as Record<string, unknown>, key) ??
    getNestedValue(translations.en as unknown as Record<string, unknown>, key) ??
    key

  if (variables) {
    for (const [k, v] of Object.entries(variables)) {
      text = text.replace(`{{${k}}}`, String(v))
    }
  }

  return text
}
