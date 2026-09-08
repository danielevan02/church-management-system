import { Download, QrCode, SunMedium } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { BlockSection } from "@/components/m3/block-section";
import { PageHeader } from "@/components/m3/page-header";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderMemberQrDataUrl } from "@/lib/qr";

export default async function MemberQrPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!session.user.memberId) notFound();

  const member = await prisma.member.findUnique({
    where: { id: session.user.memberId },
    select: { fullName: true, photoUrl: true },
  });
  if (!member) notFound();

  const { dataUrl } = await renderMemberQrDataUrl(session.user.memberId);

  const t = await getTranslations("memberPortal.qr");

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6 pb-28 sm:pb-12">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <BlockSection
        icon={QrCode}
        title={member.fullName}
        description={t("description")}
        bodyClassName="flex flex-col items-center gap-4"
      >
        {/* The one place white is not a token: a QR needs maximum quiet-zone
            contrast, and a tinted surface behind it costs scan reliability on
            an old phone camera in a dim sanctuary. */}
        <div className="rounded-3xl bg-white p-4 shadow-level-2">
          <Image
            src={dataUrl}
            alt={t("alt", { name: member.fullName })}
            width={320}
            height={320}
            className="h-60 w-60 sm:h-64 sm:w-64"
            unoptimized
          />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3.5 py-1 text-xs font-medium text-on-surface-variant">
          <SunMedium className="h-3.5 w-3.5 text-warning" />
          <span>{t("warning")}</span>
        </div>

        <Button asChild variant="tonal" className="rounded-full px-5">
          <a href={dataUrl} download={`qr-${session.user.memberId}.png`}>
            <Download className="h-4 w-4" />
            {t("download")}
          </a>
        </Button>
      </BlockSection>
    </div>
  );
}
