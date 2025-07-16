import * as Localization from "expo-localization"

/**
 * Get the device's country code for iTunes API
 * Returns ISO 3166-1 alpha-2 country code (e.g., "US", "DE", "FR")
 */
export function getDeviceCountryCode(): string {
  try {
    // Get the device locale (e.g., "en-US", "de-DE", "fr-FR")
    const locale = Localization.getLocales()[0]

    if (locale?.regionCode) {
      return locale.regionCode
    }

    // Fallback: try to extract from locale string
    const localeString = Localization.locale
    if (localeString && localeString.includes("-")) {
      const countryCode = localeString.split("-")[1]
      if (countryCode && countryCode.length === 2) {
        return countryCode.toUpperCase()
      }
    }

    // Default fallback
    return "US"
  } catch (error) {
    console.warn("Failed to get device country code:", error)
    return "US"
  }
}
