export const variantStyles = {
  primary: `bg-primary text-white hover:bg-primary-dark
        disabled:bg-gray-light disabled:cursor-not-allowed`,
  secondary: `border-2 border-primary text-primary hover:bg-primary hover:text-white
        disabled:border-gray-light disabled:text-gray-light disabled:hover:bg-transparent disabled:cursor-not-allowed`,
  ghost: `text-gray hover:text-primary 
        disabled:text-gray-light disabled:hover:text-gray-light disabled:cursor-not-allowed`,
  outline:
    "h-11 rounded-md border border-neutral-200 text-black transition-colors",
};

// Size variations
export const sizeStyles = {
  default: { button: "py-2 px-4", icon: "w-5 h-5" },
  sm: { button: "py-1 px-3 h-7 text-xs", icon: "w-4 h-4" },
};

export const buttonStyles =
  "flex align-items-center justify-center gap-2 transition-color ease-in-out rounded-full";

export const squareStyles = {
  button:
    "h-11 w-11 flex items-center justify-center rounded-md border border-neutral-200 text-black transition-colors",
  icon: "h-4 transition-all ease-in-out hover:scale-110",
};
