import clsx from "clsx";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
  variant?: "secondary";
}

const SectionContainer: React.FC<Props> = ({
  className,
  variant,
  ...props
}) => {
  const style = clsx(
    className,
    variant === "secondary" && "bg-primary/5 border border-primary/10",
    "bg-background rounded-lg p-6 text-gray",
    "prose prose-gray max-w-none",
    "prose-ul:mt-4 prose-li:text-gray prose-p:text-gray"
  );
  return <div className={style} {...props} />;
};

export default SectionContainer;
