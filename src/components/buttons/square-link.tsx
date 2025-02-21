import React from "react";

import { LucideIcon } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { squareStyles } from "./styles";

interface Props extends LinkProps {
  icon: LucideIcon;
}

const SquareLink: React.FC<Props> = ({ icon: Icon, ...props }) => {
  return (
    <Link {...props} className={squareStyles.button}>
      <Icon className={squareStyles.icon} />
    </Link>
  );
};

export default SquareLink;
