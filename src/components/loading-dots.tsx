import clsx from "clsx";
import React from "react";
const dots = "mx-[1px] inline-block h-1 w-1 animate-blink rounded-md";

interface Props {
  className: string;
}
const LoadingDots: React.FC<Props> = ({ className }) => {
  return (
    <span className="mx-2 inline-flex items-center">
      <span className={clsx(dots, className)} />
      <span className={clsx(dots, "animation-delay-[200ms]", className)} />
      <span className={clsx(dots, "animation-delay-[400ms]", className)} />
    </span>
  );
};
export default LoadingDots;
