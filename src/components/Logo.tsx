const Logo = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      className={className}
    >
      <defs>
        <linearGradient
          id="printerTopGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#E67300" />
        </linearGradient>
        <linearGradient
          id="printerBottomGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#E67300" />
          <stop offset="100%" stopColor="#CC5500" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="8"
        width="28"
        height="14"
        rx="3"
        ry="3"
        fill="url(#printerTopGradient)"
      />

      <rect
        x="6"
        y="18"
        width="20"
        height="10"
        rx="0"
        ry="0"
        fill="url(#printerBottomGradient)"
      />
    </svg>
  );
};

export default Logo;
