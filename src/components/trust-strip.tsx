interface TrustStripProps {
  items: string[];
}

const TrustStrip = ({ items }: TrustStripProps) => {
  if (!items.length) {
    return null;
  }

  const bannerText = items.join(" · ");

  return (
    <div className="bg-secondary text-white text-xs sm:text-sm">
      <p className="mx-auto max-w-5xl px-4 py-2 text-center font-medium tracking-wide">
        {bannerText}
      </p>
    </div>
  );
};

export default TrustStrip;
