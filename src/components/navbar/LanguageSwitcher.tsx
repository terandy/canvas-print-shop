"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ChevronDown, Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

export default function LanguageSwitcher({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();

  // Find current language from locale
  const currentLang =
    languages.find((lang) => lang.code === locale) || languages[0];

  const toggleLangMenu = () => setIsOpen(!isOpen);

  // Helper function to get localized path
  const getLocalizedPath = (path: string, newLocale: string) => {
    // Remove the current locale from the path
    const pathWithoutLocale = path.replace(new RegExp(`^/${locale}`), "");

    // Return the path with the new locale
    return `/${newLocale}${pathWithoutLocale || "/"}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleLangMenu}
        className="h-full flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-primary-100"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        {currentLang.name}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={getLocalizedPath(pathname, lang.code)}
              locale={lang.code}
              onClick={() => setIsOpen(false)}
              className={`${
                currentLang.code === lang.code
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-700"
              } block px-4 py-2 text-sm w-full text-left hover:bg-gray-50`}
            >
              {lang.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
