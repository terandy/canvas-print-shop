import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Your alt text";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Your Site Name</h1>
      </div>
    )
  );
}
