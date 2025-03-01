import clsx from "clsx";
import { useLocale } from "next-intl";

interface PriceProps extends React.ComponentProps<"p"> {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
}

const Price: React.FC<PriceProps> = ({
  amount,
  className,
  currencyCode = "USD",
  currencyCodeClassName,
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
        currencyDisplay: "narrowSymbol",
      }).format(parseFloat(amount))}`}
      <span
        className={clsx("ml-1 inline", currencyCodeClassName)}
      >{`${currencyCode}`}</span>
    </p>
  );
};

export default Price;
