import clsx from "clsx";
import { useLocale } from "next-intl";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyDisplay?: "code" | "symbol" | "name" | "narrowSymbol";
}

const Price: React.FC<PriceProps> = ({
  amount,
  className,
  currencyCode = "CAD",
  currencyDisplay = "symbol",
}) => {
  // Get the current locale
  const locale = useLocale();

  // Map of locales to number format locales
  const localeMap: Record<string, string> = {
    en: "en-CA",
    fr: "fr-CA",
  };

  // Use the appropriate locale for number formatting
  const numberFormatLocale = localeMap[locale] || "en-CA";

  return (
    <p suppressHydrationWarning={true} className={className}>
      {`${new Intl.NumberFormat(numberFormatLocale, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay,
      }).format(parseFloat(amount))}`}
    </p>
  );
};

export default Price;
