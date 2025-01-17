import clsx from "clsx";
import { ComponentProps } from "react";

const Grid: React.FC<ComponentProps<"ul">> & { Item: React.FC<ComponentProps<"li">> } = (props) => {
  return (
    <ul
      {...props}
      className={clsx("grid grid-flow-row gap-4", props.className)}
    >
      {props.children}
    </ul>
  );
}

const GridItem: React.FC<ComponentProps<"li">> = (props) => {
  return (
    <li
      {...props}
      className={clsx("aspect-square transition-opacity", props.className)}
    >
      {props.children}
    </li>
  );
}

Grid.Item = GridItem;
export default Grid;
