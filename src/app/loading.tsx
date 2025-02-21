import { LoaderCircle } from "lucide-react";

export default function Loading({ message }: { message?: string }) {
  return (
    <div className="flex flex-col gap-3 items-center justify-center min-h-screen">
      {message && <p>{message}</p>}
      <LoaderCircle
        className={"animate-spin rounded-full h-16 w-16 text-gray-500"}
      />
    </div>
  );
}
