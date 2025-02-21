import React from "react";
import clsx from "clsx";
import { ArrowRight, LucideIcon } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { ComponentProps } from "react";
import { buttonStyles, sizeStyles, variantStyles } from "./styles";

interface Props extends LinkProps, Omit<ComponentProps<"a">, "href"> {
  variant?: keyof typeof variantStyles;
  children?: React.ReactNode;
  size?: keyof typeof sizeStyles;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const ButtonLink: React.FC<Props> = ({
  className,
  size = "default",
  children,
  variant = "primary",
  icon: Icon,
  iconPosition = "right",
  ...props
}) => {
  const linkClassName = clsx(
    className,
    buttonStyles,
    variantStyles[variant],
    sizeStyles[size].button,
    iconPosition === "right" && "flex-row-reverse"
  );

  const iconClassName = clsx(sizeStyles[size].icon);

  const LinkIcon = Icon ? Icon : ArrowRight;

  return (
    <Link {...props}>
      <span className={linkClassName}>
        <LinkIcon className={iconClassName} />
        {children}
      </span>
    </Link>
  );
};

export default ButtonLink;
