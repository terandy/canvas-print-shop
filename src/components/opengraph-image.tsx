import { ImageResponse } from "next/og";

export type Props = {
  title?: string;
};

const OpengraphImage = async (
  props?: Props
): Promise<ImageResponse> => {
  const { title } = {
    ...{
      title: process.env.SITE_NAME,
    },
    ...props,
  };

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col items-center justify-center bg-black">
        <div tw="flex flex-none items-center justify-center border border-neutral-700 h-[160px] w-[160px] rounded-3xl">
          LOGO
        </div>
        <p tw="mt-12 text-6xl font-bold text-white">{title}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

export default OpengraphImage;
