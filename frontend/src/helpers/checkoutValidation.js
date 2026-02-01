/**
 * Country-specific phone (by dial code) and postal code validation for checkout.
 * Used with react-hook-form validate().
 */

// National number length [min, max] digits (after stripping spaces/dashes) per dial code.
// E.164: total ≤15; national part varies by country.
const PHONE_BY_DIAL = {
  "1": [10, 10],       // USA/Canada
  "20": [9, 9],        // Egypt
  "27": [9, 9],        // South Africa
  "31": [9, 9],        // Netherlands
  "32": [8, 9],        // Belgium
  "33": [9, 9],        // France
  "34": [9, 9],        // Spain
  "39": [9, 11],       // Italy
  "44": [10, 11],      // UK
  "49": [10, 11],      // Germany
  "55": [10, 11],      // Brazil
  "61": [9, 9],        // Australia
  "81": [10, 10],      // Japan
  "86": [10, 11],      // China
  "91": [10, 10],      // India
  "212": [9, 9],       // Morocco
  "213": [8, 9],       // Algeria
  "216": [8, 8],       // Tunisia
  "233": [9, 9],       // Ghana
  "234": [10, 10],     // Nigeria
  "237": [8, 8],       // Cameroon
  "249": [9, 9],       // Sudan
  "250": [9, 9],       // Rwanda
  "251": [9, 9],       // Ethiopia
  "252": [8, 9],       // Somalia
  "253": [8, 8],       // Djibouti
  "254": [9, 9],       // Kenya
  "255": [9, 9],       // Tanzania
  "256": [9, 9],       // Uganda
  "257": [8, 8],       // Burundi
  "258": [9, 9],       // Mozambique
  "260": [9, 9],       // Zambia
  "263": [9, 9],       // Zimbabwe
  "265": [9, 9],       // Malawi
  "267": [7, 7],       // Botswana
  "353": [9, 9],       // Ireland
  "886": [9, 9],       // Taiwan
  "971": [9, 9],       // UAE
  "211": [9, 9],       // South Sudan
};

const DEFAULT_PHONE_LEN = [7, 12]; // fallback for unlisted dial codes

/**
 * Validate national phone number (no country code) for a given dial code.
 * @param {string} nationalNumber - digits only (spaces/dashes stripped)
 * @param {string} dialCode - e.g. "254", "44", "1"
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePhoneByDial(nationalNumber, dialCode) {
  const digits = (nationalNumber || "").replace(/\D/g, "");
  if (digits.length === 0) {
    return { valid: false, message: "Enter a valid phone number" };
  }
  const [min, max] = PHONE_BY_DIAL[dialCode] || DEFAULT_PHONE_LEN;
  if (digits.length < min || digits.length > max) {
    return {
      valid: false,
      message: `Enter a valid phone number (${min}–${max} digits for this country)`,
    };
  }
  return { valid: true };
}

/**
 * Postal code validation by country name (matches OrderSummary COUNTRIES).
 * Empty postal is valid for countries that don't require it (e.g. Kenya).
 */
const POSTAL_BY_COUNTRY = {
  Kenya: null,           // no strict format; optional
  Tanzania: null,
  Uganda: null,
  Rwanda: null,
  Ethiopia: null,
  "South Africa": /^[0-9]{4}$/,
  Nigeria: null,
  "United States": /^\d{5}(-\d{4})?$/,
  "United Kingdom": /^[A-Za-z]{1,2}[0-9][A-Za-z0-9]?\s?[0-9][A-Za-z]{2}$/,
  Canada: /^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]$/,
  Australia: /^[0-9]{4}$/,
  Germany: /^[0-9]{5}$/,
  France: /^[0-9]{5}$/,
  Italy: /^[0-9]{5}$/,
  Spain: /^[0-9]{5}$/,
  Netherlands: /^[0-9]{4}\s?[A-Za-z]{2}$/,
  Belgium: /^[0-9]{4}$/,
  India: /^[0-9]{6}$/,
  China: /^[0-9]{6}$/,
  Japan: /^[0-9]{3}-?[0-9]{4}$/,
  Brazil: /^[0-9]{5}-?[0-9]{3}$/,
  Mexico: /^[0-9]{5}$/,
  Egypt: /^[0-9]{5}$/,
  "Saudi Arabia": /^[0-9]{5}(-[0-9]{4})?$/,
  "United Arab Emirates": null,
  Taiwan: /^[0-9]{3,5}$/,
  Ireland: null,
  Poland: /^[0-9]{2}-?[0-9]{3}$/,
  Sweden: /^[0-9]{3}\s?[0-9]{2}$/,
  Switzerland: /^[0-9]{4}$/,
  Austria: /^[0-9]{4}$/,
};

/**
 * Validate postal code for a given country. Empty is allowed for countries with null pattern.
 * @param {string} postalCode
 * @param {string} countryName
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePostalByCountry(postalCode, countryName) {
  const trimmed = (postalCode || "").trim();
  const pattern = POSTAL_BY_COUNTRY[countryName];
  if (pattern === undefined) {
    // Unknown country: allow alphanumeric up to 12 chars or empty
    if (trimmed.length > 12) {
      return { valid: false, message: "Postal code too long" };
    }
    return { valid: true };
  }
  if (pattern === null) {
    // No strict format; optional
    if (trimmed.length > 20) {
      return { valid: false, message: "Postal code too long" };
    }
    return { valid: true };
  }
  if (trimmed.length === 0) {
    return { valid: true }; // optional for display; can require per-country if needed
  }
  const normalized = trimmed.replace(/\s+/g, " ");
  if (!pattern.test(normalized)) {
    return {
      valid: false,
      message: "Enter a valid postal code for this country",
    };
  }
  return { valid: true };
}
