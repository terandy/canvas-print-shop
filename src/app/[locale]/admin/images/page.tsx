import { getTranslations } from "next-intl/server";
import { listAllS3Images } from "@/lib/s3/queries";
import { getImageAssociations } from "@/lib/db/queries/images";
import ImageGallery, {
  type S3ImageWithAssociations,
} from "@/components/admin/image-gallery";

interface Props {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function AdminImagesPage({ searchParams }: Props) {
  const t = await getTranslations("Admin");
  const { filter } = await searchParams;

  const [s3Images, associationMap] = await Promise.all([
    listAllS3Images(),
    getImageAssociations(),
  ]);

  const images: S3ImageWithAssociations[] = s3Images.map((img) => {
    const associations = associationMap.get(img.url) || [];

    let status: S3ImageWithAssociations["status"] = "orphaned";
    if (associations.some((a) => a.type === "order")) status = "order";
    else if (associations.some((a) => a.type === "cart")) status = "cart";
    else if (associations.some((a) => a.type === "product")) status = "product";

    return {
      key: img.key,
      url: img.url,
      lastModified: img.lastModified?.toISOString() || null,
      size: img.size,
      associations,
      status,
    };
  });

  const filteredImages = filter
    ? images.filter((img) => img.status === filter)
    : images;

  filteredImages.sort((a, b) => {
    if (a.status === "orphaned" && b.status !== "orphaned") return -1;
    if (a.status !== "orphaned" && b.status === "orphaned") return 1;
    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return dateB - dateA;
  });

  const orphanedUrls = images
    .filter((img) => img.status === "orphaned")
    .map((img) => img.url);

  const counts = {
    all: images.length,
    order: images.filter((i) => i.status === "order").length,
    cart: images.filter((i) => i.status === "cart").length,
    product: images.filter((i) => i.status === "product").length,
    orphaned: orphanedUrls.length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("images.title")}
        </h1>
      </div>

      <ImageGallery
        images={filteredImages}
        orphanedUrls={orphanedUrls}
        currentFilter={filter || ""}
        counts={counts}
      />
    </div>
  );
}
