import clsx from "clsx";
import { LoaderCircle, LucideIcon } from "lucide-react";
import React, { ComponentProps } from "react";
import { buttonStyles, sizeStyles, variantStyles } from "./styles";

interface Props extends ComponentProps<"button"> {
  icon?: LucideIcon;
  variant?: keyof typeof variantStyles;
  disabledMessage?: string;
  loading?: boolean;
  size?: keyof typeof sizeStyles;
  iconPosition?: "left" | "right";
}

const Button: React.FC<Props> = ({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabledMessage,
  title,
  disabled,
  loading = false,
  size = "default",
  iconPosition = "left",
  ...props
}) => {
  const buttonClassName = clsx(
    className,
    sizeStyles[size].button,
    buttonStyles,
    Icon && !!children && "pe-6",
    variantStyles[variant],
    loading && "opacity-75",
    iconPosition === "right" && "flex-row-reverse"
  );
  const iconClassName = clsx(loading && "animate-spin", sizeStyles[size].icon);

  const ButtonIcon = loading ? LoaderCircle : Icon;
  return (
    <button
      className={buttonClassName}
      title={disabled ? disabledMessage : title}
      disabled={disabled || loading}
      {...props}
    >
      {ButtonIcon && <ButtonIcon className={iconClassName} />}
      {children}
    </button>
  );
};

export default Button;
