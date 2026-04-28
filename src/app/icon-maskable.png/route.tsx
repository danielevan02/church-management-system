import { ImageResponse } from "next/og";

import { church } from "@/config/church";

export const dynamic = "force-static";

// Maskable icons need ~10% safe-zone padding on each side so the OS can crop
// to a circle/squircle without cutting off content.
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
          fontSize: 180,
          fontWeight: 700,
          letterSpacing: -4,
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 60,
        }}
      >
        {church.shortName.slice(0, 3).toUpperCase()}
      </div>
    ),
    { width: 512, height: 512 },
  );
}
