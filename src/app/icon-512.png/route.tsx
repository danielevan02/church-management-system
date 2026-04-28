import { ImageResponse } from "next/og";

import { church } from "@/config/church";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: church.primaryColor,
          color: "#ffffff",
          fontSize: 240,
          fontWeight: 700,
          letterSpacing: -6,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {church.shortName.slice(0, 3).toUpperCase()}
      </div>
    ),
    { width: 512, height: 512 },
  );
}
