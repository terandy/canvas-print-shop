import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { ComponentProps } from "react";

const CloseCart: React.FC<ComponentProps<"div">> = ({ className }) => {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className
        )}
      />
    </div>
  );
}

export default CloseCart;