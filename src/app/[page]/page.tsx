import Prose from "@/components/prose";
import { getPage } from "@/lib/shopify";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params?: Promise<{ handle: string }>;
  searchParams?: Promise<any>;
}


export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const page = await getPage(params?.handle ?? "");

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
  };
}

const Page = async (props: Props): Promise<React.ReactNode> => {
  const params = await props.params
  const page = await getPage(params?.handle ?? "");

  if (!page) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body as string} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(
          undefined,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}

export default Page;
