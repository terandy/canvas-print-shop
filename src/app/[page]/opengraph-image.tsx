import OpengraphImage from "@/components/opengraph-image";
import { getPage } from "@/lib/shopify";

export const runtime = "edge";

export default async function Image(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const page = await getPage(params.page);
  const title = page.seo?.title || page.title;

  return await OpengraphImage({ title });
}
