import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Canvas Print Shop - Custom Canvas Prints Made in Canada";
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
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "20px",
          }}
        >
          Canvas Print Shop
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#e0e0e0",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Custom Canvas Prints &amp; Framing — Hand-Crafted in Quebec, Canada
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#a0a0a0",
            marginTop: "30px",
          }}
        >
          canvasprintshop.ca
        </div>
      </div>
    )
  );
}
