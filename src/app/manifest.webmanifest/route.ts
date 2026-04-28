import { NextResponse } from "next/server";

import { church } from "@/config/church";

export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: `${church.name} — Portal Jemaat`,
    short_name: church.shortName,
    description: `Portal jemaat ${church.name}.`,
    start_url: "/me/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: church.primaryColor,
    lang: church.defaultLocale,
    dir: "ltr",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  } as const;

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
