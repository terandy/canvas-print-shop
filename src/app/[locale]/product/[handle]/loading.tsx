import { LoadingSpinner } from "@/components";

export default function Loading({ message }: { message?: string }) {
  return <LoadingSpinner message={message} />;
}
