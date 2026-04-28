import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PrintButton } from "./print-button";
import { Button } from "@/components/ui/button";
import { church } from "@/config/church";
import { auth } from "@/lib/auth";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { renderServiceQrDataUrl } from "@/lib/service-qr";
import { getService } from "@/server/queries/services";

export default async function ServiceQrBannerPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const { id, locale } = await params;
  const service = await getService(id);
  if (!service) notFound();

  const { url, dataUrl } = await renderServiceQrDataUrl(id, locale);

  const t = await getTranslations("attendance.qrBanner");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hide admin chrome (sidebar + admin header) when printing */}
      <style>{`
        @media print {
          [data-slot="sidebar-wrapper"] > [data-slot="sidebar"] { display: none !important; }
          [data-slot="sidebar-inset"] > header:first-of-type { display: none !important; }
          html, body { background: white !important; }
        }
      `}</style>

      {/* Toolbar — hidden when printing */}
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/attendance/services/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <PrintButton label={t("print")} />
      </div>

      {/* Banner — printable */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            {church.name}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-lg text-muted-foreground">
            {format(service.startsAt, "EEEE, dd MMMM yyyy · HH:mm", {
              locale: locale === "id" ? idLocale : undefined,
            })}
            {service.location ? ` · ${service.location}` : ""}
          </p>
        </div>

        <div className="rounded-2xl border-4 border-foreground/10 bg-white p-6 shadow-lg print:shadow-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={t("qrAlt", { name: service.name })}
            className="block h-auto w-full max-w-[480px]"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-semibold">{t("instruction")}</p>
          <p className="text-sm text-muted-foreground">{t("howTo")}</p>
        </div>

        <p className="break-all text-xs text-muted-foreground">{url}</p>
      </main>
    </div>
  );
}
