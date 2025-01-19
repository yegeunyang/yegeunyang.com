import { ImageResponse } from "next/og";
import { fullName } from "app/sitemap";

export const dynamic = "force-static";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          fontSize: 128,
          fontWeight: 900,
        }}
      >
        {fullName}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
