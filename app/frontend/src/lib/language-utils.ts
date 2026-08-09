// Language detection and formatting utilities

/**
 * Detects if text contains Urdu characters
 * Urdu Unicode ranges:
 * - 0x0600-0x06FF: Arabic (includes Urdu)
 * - 0xFB50-0xFDFF: Arabic Presentation Forms-A
 * - 0xFE70-0xFEFF: Arabic Presentation Forms-B
 */
export function detectLanguage(text: string): "urdu" | "english" {
  if (!text) return "english";

  // Count Urdu/Arabic characters
  const urduRegex = /[؀-ۿﭐ-﷿ﹰ-﻿]/g;
  const urduMatches = text.match(urduRegex);
  const urduCount = urduMatches ? urduMatches.length : 0;

  // If more than 20% of characters are Urdu, consider it Urdu
  return urduCount > text.length * 0.2 ? "urdu" : "english";
}

/**
 * Converts English digits to Urdu numerals
 * Maps: 0→۰, 1→۱, 2→۲, 3→۳, 4→۴, 5→۵, 6→۶, 7→۷, 8→۸, 9→۹
 */
export function convertToUrduNumerals(text: string): string {
  const urduNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return text.replace(/\d/g, (digit) => urduNumbers[parseInt(digit)]);
}

/**
 * Converts Urdu numerals to English digits
 */
export function convertToEnglishNumerals(text: string): string {
  const urduNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = text;
  urduNumbers.forEach((urdu, index) => {
    result = result.replace(new RegExp(urdu, 'g'), index.toString());
  });
  return result;
}

/**
 * Gets appropriate CSS classes for language-based formatting
 */
export function getLanguageClasses(language: "urdu" | "english"): string {
  if (language === "urdu") {
    return "rtl text-right";
  }
  return "ltr text-left";
}

/**
 * Ensures response has proper numerals and direction based on language
 */
export function formatResponseByLanguage(
  content: string,
  language: "urdu" | "english"
): string {
  if (language === "urdu") {
    // Convert English digits to Urdu numerals for Urdu responses
    return convertToUrduNumerals(content);
  }
  // Ensure English numerals for English responses
  return convertToEnglishNumerals(content);
}
