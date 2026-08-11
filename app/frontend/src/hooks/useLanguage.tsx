/**
 * Hook for managing language preferences
 */

import { useAuth } from "@/contexts/AuthContext";
import { getAPIEndpoint } from "@/lib/api-config";
import { useEffect, useState } from "react";

export type Language = "english" | "urdu";

/**
 * Hook to get and set user language preference
 */
export function useLanguage() {
  const { user, token } = useAuth();
  const [language, setLanguageState] = useState<Language>(
    (user?.language_preference as Language) || "english"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user?.language_preference) {
      setLanguageState(user.language_preference as Language);
    }
  }, [user?.language_preference]);

  /**
   * Change language preference
   */
  const setLanguage = async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      setError(null);

      // Save to backend
      const response = await fetch(getAPIEndpoint("/api/v1/users/language"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ language_preference: newLanguage }),
      });

      if (!response.ok) {
        // If endpoint doesn't exist or fails, just update locally
        if (response.status === 404 || response.status === 500) {
          setLanguageState(newLanguage);
          localStorage.setItem("language_preference", newLanguage);
          return;
        }
        throw new Error("Failed to update language preference");
      }

      setLanguageState(newLanguage);
      localStorage.setItem("language_preference", newLanguage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update language");
      // Still update locally even if backend fails
      setLanguageState(newLanguage);
      localStorage.setItem("language_preference", newLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    language,
    setLanguage,
    isLoading,
    error,
  };
}

/**
 * Get translation text based on language
 */
export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const translations: Record<string, Record<Language, string>> = {
      "chat.placeholder": {
        english: "Describe your situation... (English or Urdu)",
        urdu: "اپنی صورتحال بیان کریں... (انگریزی یا اردو)",
      },
      "chat.profile": {
        english: "My Profile",
        urdu: "میرا پروفائل",
      },
      "chat.settings": {
        english: "Settings",
        urdu: "سیٹنگز",
      },
      "chat.language": {
        english: "Language",
        urdu: "زبان",
      },
      "chat.signOut": {
        english: "Sign Out",
        urdu: "سائن آؤٹ",
      },
      "profile.title": {
        english: "My Profile",
        urdu: "میرا پروفائل",
      },
      "settings.title": {
        english: "Settings",
        urdu: "سیٹنگز",
      },
    };

    return translations[key]?.[language] || key;
  };

  return { t, language };
}
