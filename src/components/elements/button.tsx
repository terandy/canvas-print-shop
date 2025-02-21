import clsx from "clsx";
import { LoaderCircle, LucideIcon } from "lucide-react";
import React, { ComponentProps } from "react";

interface Props extends ComponentProps<"button"> {
  icon?: LucideIcon;
  variant?: keyof typeof variantClassName;
  disabledMessage?: string;
  loading?: boolean;
}

const variantClassName = {
  primary: `bg-primary text-white hover:bg-primary-dark
      disabled:bg-gray-light disabled:cursor-not-allowed`,
  secondary: `border-2 border-primary text-primary hover:bg-primary hover:text-white
      disabled:border-gray-light disabled:text-gray-light disabled:hover:bg-transparent disabled:cursor-not-allowed`,
  ghost: `text-gray hover:text-primary 
      disabled:text-gray-light disabled:hover:text-gray-light disabled:cursor-not-allowed`,
};

const Button: React.FC<Props> = ({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabledMessage,
  title,
  disabled,
  loading = false,
  ...props
}) => {
  const buttonClassName = clsx(
    "flex gap-2 px-4 py-2 rounded-full transition-colors",
    variantClassName[variant],
    {
      "opacity-75": loading,
    },
    Icon && "pe-6",
    className
  );

  const ButtonIcon = loading ? LoaderCircle : Icon;
  return (
    <button
      className={buttonClassName}
      title={disabled ? disabledMessage : title}
      disabled={disabled || loading}
      {...props}
    >
      {ButtonIcon && <ButtonIcon className={clsx(loading && "animate-spin")} />}
      {children}
    </button>
  );
};

export default Button;
