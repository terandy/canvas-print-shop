import clsx from "clsx";
import Image from "next/image";
import Label from "../label";

interface Props extends React.ComponentProps<typeof Image> {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
}
const GridTileImage: React.FC<Props> = ({
  isInteractive = true,
  active,
  label,
  ...props
}) => {
  return <div className={clsx("group flex h-full w-full items-center justify-center overflow-hidden border bg-[rgb(235,235,235)] hover:border-blue-600 dark:bg-black", {
    relative: label,
    "border-2 border-blue-600": active,
    "border-neutral-200 dark:border-neutral-800": !active
  })}>
    {props.src ? <Image className={clsx("relative h-full w-full object-contain", {
      "transition duration-300 ease-in-out group-hover:scale-105": isInteractive
    })} {...props} /> : null}
    {label ? <Label title={label.title} amount={label.amount} currencyCode={label.currencyCode} position={label.position} /> : null}
  </div>;
};

export default GridTileImage