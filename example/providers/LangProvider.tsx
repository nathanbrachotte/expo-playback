import React, { createContext, useContext, useMemo, useState } from "react"

const messages = {
  en: {
    // TODO: Add some way to pass variables to the translation instead of KISSing
    "order.tracking.less_than_one_minute": "<1 Min",
    "order.tracking.loading": "... Mins",
    "order.tracking.minute_short_plural": "Mins",
    "order.tracking.one_minute": "1 Min",
    "order.tracking.preparing": "Your order is\nbeing prepared",
    "order.tracking.ready": "Ready!",
    "scan.camera.error": "Could not access camera. Please try enabling it in settings.",
    "scan.camera.grant": "Continue",
    "scan.camera.permission": "Please enable camera access to scan the QR code",
    "scan.subtitle": "You will find it on your receipt.",
    "scan.title": "Scan your QR Code",
    "scan.instructions.title": "How it works",
    "scan.instructions.step1": "Make a purchase at the kiosk or the counter in any Mmaah store",
    "scan.instructions.step2": "Look at the bottom of your receipt to find the QR code",
    "scan.instructions.step3": "Scan the QR code to track your order",
    "scan.instructions.got_it": "Got it",
    "scan.qr_not_found": "I can't find my QR code",
    "order.details.title": "Order #{0}",
    "order.details.your_order": "Your Order",
    "order.details.discounts": "Discounts",
    "order.details.total": "Total",
    "network.error.no_internet_connection": "No internet. Please check your connection and try again.",
  },
  de: {
    "order.tracking.less_than_one_minute": "<1 Min",
    "order.tracking.loading": "... Min",
    "order.tracking.minute_short_plural": "Mins",
    "order.tracking.one_minute": "1 Min",
    "order.tracking.preparing": "Deine Bestellung\nwird zubereitet",
    "order.tracking.ready": "Fertig!",
    "scan.camera.error": "Kein Zugriff auf die Kamera möglich. Bitte aktiviere die Kamera in den Einstellungen.",
    "scan.camera.grant": "Weiter",
    "scan.camera.permission": "Bitte aktiviere die Kamera, um den QR-Code zu scannen",
    "scan.subtitle": "Du findest es auf deiner Quittung.",
    "scan.title": "QR-Code scannen",
    "scan.instructions.title": "So funktioniert es",
    "scan.instructions.step1": "Bestelle dein Essen am Kiosk oder an der Theke in jedem Mmaah Store",
    "scan.instructions.step2": "Finde den QR-Code am Ende deines Kassenbons",
    "scan.instructions.step3": "Scanne den QR-Code, um deine Bestellung zu verfolgen",
    "scan.instructions.got_it": "Verstanden",
    "scan.qr_not_found": "Wo ist mein QR-Code",
    "order.details.title": "Bestellung #{0}",
    "order.details.your_order": "Deine Bestellung",
    "order.details.discounts": "Rabatte",
    "order.details.total": "Gesamt",
    "network.error.no_internet_connection":
      "Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  },
} as const

type SupportedLanguage = keyof typeof messages
type MessageKey = keyof (typeof messages)[SupportedLanguage]

const DEFAULT_LANGUAGE_TAG: SupportedLanguage = "en"

const getSupportedLanguage = (languageTag: string): SupportedLanguage => {
  const lang = languageTag.split("-")[0].toLowerCase()
  return lang in messages ? (lang as SupportedLanguage) : DEFAULT_LANGUAGE_TAG
}

type I18nContextType = {
  t: (key: MessageKey, ...args: any[]) => string
  currentLanguage: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  availableLanguages: SupportedLanguage[]
}

const I18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider: React.FC<{
  children: React.ReactNode
  language: string
}> = ({ children, language }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getSupportedLanguage(language))

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage: setCurrentLanguage,
      availableLanguages: Object.keys(messages) as SupportedLanguage[],
      t: (key: MessageKey, ...args: any[]) => {
        const message = messages[currentLanguage][key] || messages[DEFAULT_LANGUAGE_TAG][key]
        return message.replace(/\{(\d+)\}/g, (_, index) => String(args[Number(index)] ?? ""))
      },
    }),
    [currentLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useTranslations = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useTranslations must be used within an I18nProvider")
  }
  return context.t
}

export const useI18nContext = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18nContext must be used within an I18nProvider")
  }
  return context
}
