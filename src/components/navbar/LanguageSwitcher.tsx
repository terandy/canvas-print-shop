"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";

const localeNames = {
  en: "English",
  fr: "Français",
};

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "buttons" | "minimal";
}

const LanguageSwitcher = ({
  className = "",
  variant = "dropdown",
}: LanguageSwitcherProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [basePath, setBasePath] = useState("");

  useEffect(() => {
    // Ensure pathname is defined before manipulating it
    if (pathname) {
      const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "");
      setBasePath(pathWithoutLocale || "/");
    }
  }, [pathname]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Construct the new localized path
    const newPath = `/${newLocale}${basePath}`;
    router.push(newPath);
    closeDropdown();
  };

  // Dropdown variant
  if (variant === "dropdown") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={toggleDropdown}
          className="h-full flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Globe className="w-4 h-4" />
          <span>{localeNames[locale as keyof typeof localeNames]}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Overlay to catch clicks outside the dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={closeDropdown}
              aria-hidden="true"
            />

            {/* Dropdown menu */}
            <div className="absolute z-20 mt-1 w-full min-w-[150px] bg-white border rounded-md shadow-lg">
              {Object.entries(localeNames).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    code === locale ? "font-semibold bg-gray-50" : ""
                  }`}
                  aria-current={code === locale ? "true" : "false"}
                >
                  {name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Buttons variant
  if (variant === "buttons") {
    return (
      <div className={`flex rounded-md overflow-hidden border ${className}`}>
        {Object.entries(localeNames).map(([code, name]) => (
          <button
            key={code}
            onClick={() => switchLocale(code)}
            className={`px-3 py-2 text-sm ${
              code === locale
                ? "bg-primary text-white font-medium"
                : "bg-white hover:bg-gray-50"
            }`}
            aria-current={code === locale ? "true" : "false"}
          >
            {name}
          </button>
        ))}
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Globe className="w-4 h-4" />
      {Object.entries(localeNames).map(([code, name]) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={`px-2 py-1 text-sm ${
            code === locale
              ? "font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          aria-current={code === locale ? "true" : "false"}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
