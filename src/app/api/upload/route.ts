import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/s3/actions/image";

export async function POST(request: NextRequest) {
  return uploadImage(request);
}
