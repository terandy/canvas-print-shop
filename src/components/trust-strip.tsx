import Image from "next/image";

type TrustStripItem = { text: string; includeLeaves?: boolean };

export default function TrustStrip({ items }: { items: TrustStripItem[] }) {
  if (!items.length) return null;
  return (
    <div className="bg-secondary px-4 text-[#F5F1EA]">
      <div className="mx-auto flex min-h-8 max-w-[1440px] flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1.5 sm:gap-x-8">
        {items.map((item, index) => (
          <span
            key={item.text}
            className={`items-center gap-6 sm:gap-8 ${index === 0 ? "flex" : "hidden sm:flex"}`}
          >
            {index > 0 && (
              <span
                className="h-0.5 w-0.5 rounded-full bg-[#D29C74]"
                aria-hidden="true"
              />
            )}
            <span className="flex items-center gap-2 text-[10px] font-medium uppercase leading-4 tracking-[0.13em]">
              {item.includeLeaves && (
                <Image
                  src="/canadian-leaf.png"
                  width={12}
                  height={12}
                  alt=""
                  className="h-3 w-3 shrink-0 object-contain opacity-90"
                />
              )}
              {item.text}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
