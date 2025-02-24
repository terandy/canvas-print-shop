import React from "react";

interface Props {
  children?: React.ReactNode;
  count?: number;
}

const Badge: React.FC<Props> = ({ children, count }) => {
  if (!count) return children;
  return (
    <div className="relative">
      {children}
      <span className="absolute px-[6px] py-[1px] -mt-2 -mr-2 rounded-full top-0 right-0 text-xs bg-primary text-white">
        {count}
      </span>
    </div>
  );
};

export default Badge;
