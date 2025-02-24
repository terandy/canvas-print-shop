import React from "react";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";
import { squareStyles } from "./styles";

interface Props extends ComponentProps<"button"> {
  icon: LucideIcon;
}

const SquareButton: React.FC<Props> = ({ icon: Icon, ...props }) => {
  return (
    <button {...props} className={squareStyles.button}>
      <Icon className={squareStyles.icon} />
    </button>
  );
};

export default SquareButton;
