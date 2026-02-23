import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Client";

export interface S3Object {
  key: string;
  url: string;
  lastModified: Date | undefined;
  size: number | undefined;
}

export async function listAllS3Images(): Promise<S3Object[]> {
  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION!;
  const allObjects: S3Object[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "uploads/",
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          allObjects.push({
            key: obj.Key,
            url: `https://${bucket}.s3.${region}.amazonaws.com/${obj.Key}`,
            lastModified: obj.LastModified,
            size: obj.Size,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return allObjects;
}
