import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import React, { ComponentProps } from "react";

interface Props extends ComponentProps<"h2"> {
  icon?: LucideIcon;
}

const SectionHeader: React.FC<Props> = ({
  className,
  children,
  icon: Icon,
  ...props
}) => {
  const headerClassName = clsx(
    className,
    "text-2xl font-semibold text-secondary flex gap-3 items-center mb-4"
  );
  return (
    <h2 {...props} className={headerClassName}>
      {Icon && <Icon className="w-6 h-6 text-primary" />}
      {children}
    </h2>
  );
};
export default SectionHeader;
