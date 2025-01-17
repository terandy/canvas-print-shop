import clsx from "clsx";

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
  currencyCodeClassName
}) => <p suppressHydrationWarning={true} className={className}>
    {`${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol"
    }).format(parseFloat(amount))}`}
    <span className={clsx("ml-1 inline", currencyCodeClassName)}>{`${currencyCode}`}</span>
  </p>;
export default Price;