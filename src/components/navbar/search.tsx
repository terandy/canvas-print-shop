"use client";

import { createUrl } from "@/lib/utils/base";
import { ArrowRight, SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useId } from "react";

interface Props {
  onSearch?: () => void;
}

export default function Search({ onSearch }: Props) {
  const t = useTranslations("Search");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputId = useId();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const search = new FormData(e.currentTarget)
      .get("search")
      ?.toString()
      .trim();
    const newParams = new URLSearchParams(searchParams.toString());
    if (search) newParams.set("q", search);
    else newParams.delete("q");
    router.push(createUrl(`/${locale}/search`, newParams));
    onSearch?.();
  }

  return (
    <form
      role="search"
      aria-label={t("title")}
      onSubmit={onSubmit}
      className="relative w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        {t("title")}
      </label>
      <SearchIcon
        className="pointer-events-none absolute left-3.5 top-3.5 h-[18px] w-[18px] text-gray"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <input
        id={inputId}
        key={searchParams.get("q")}
        type="search"
        name="search"
        placeholder={t("placeholder")}
        autoComplete="off"
        defaultValue={searchParams.get("q") || ""}
        className="h-12 w-full rounded-sm border border-secondary/15 bg-white/60 pl-11 pr-14 text-base text-secondary outline-none transition-colors placeholder:text-gray focus:border-primary-dark focus:ring-1 focus:ring-primary-dark lg:text-sm"
      />
      <button
        type="submit"
        aria-label={t("submit")}
        className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-sm text-secondary transition-colors hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
