import Image from "next/image";

type TrustStripItem = {
  text: string;
  includeLeaves?: boolean;
};

interface TrustStripProps {
  items: TrustStripItem[];
}

const TrustStrip = ({ items }: TrustStripProps) => {
  if (!items.length) {
    return null;
  }

  const scrollingItems = [...items, ...items];

  const marqueeItems = scrollingItems.flatMap((item, index) => {
    const nodes = [
      <BannerItem key={`${item.text}-${index}`} item={item} />,
    ];

    if (index !== scrollingItems.length - 1) {
      nodes.push(<Separator key={`separator-${index}`} />);
    }

    return nodes;
  });

  return (
    <div className="bg-secondary text-white text-xs sm:text-sm overflow-hidden">
      <div className="flex min-w-full animate-marquee gap-6 whitespace-nowrap">
        {marqueeItems}
      </div>
    </div>
  );
};

const BannerItem = ({ item }: { item: TrustStripItem }) => (
  <span className="flex items-center gap-2 px-6 py-2 font-medium tracking-wide uppercase">
    {item.includeLeaves && <LeafIcon />}
    <span>{item.text}</span>
    {item.includeLeaves && <LeafIcon />}
  </span>
);

const Separator = () => (
  <span
    aria-hidden="true"
    className="flex items-center justify-center px-4 text-white/60 text-base sm:text-lg font-semibold"
  >
    {"\u2022"}
  </span>
);

const LeafIcon = () => (
  <Image
    src="/canadian-leaf.png"
    alt=""
    width={16}
    height={16}
    className="opacity-90"
    aria-hidden="true"
  />
);

export default TrustStrip;
