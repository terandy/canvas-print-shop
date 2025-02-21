import clsx from "clsx";
import { ComponentProps } from "react";

const PageHeader: React.FC<ComponentProps<"h1">> = ({
  className,
  ...props
}) => {
  const styles = clsx(
    className,
    "text-4xl font-bold text-secondary mb-12 text-center"
  );
  return <h1 className={styles} {...props} />;
};

export default PageHeader;
