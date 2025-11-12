import Image from "next/image";

interface TrustStripProps {
  message: string | null;
}

const TrustStrip = ({ message }: TrustStripProps) => {
  if (!message) {
    return null;
  }

  return (
    <div className="bg-secondary text-white text-xs sm:text-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-4 py-2 text-center font-medium tracking-wide">
        <LeafIcon />
        <span>{message}</span>
        <LeafIcon />
      </div>
    </div>
  );
};

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
