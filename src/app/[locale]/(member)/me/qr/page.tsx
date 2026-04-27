import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{member.fullName}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="rounded-lg border bg-white p-4">
            <Image
              src={dataUrl}
              alt={t("alt", { name: member.fullName })}
              width={320}
              height={320}
              className="h-64 w-64"
              unoptimized
            />
          </div>
          <Button asChild variant="outline">
            <a
              href={dataUrl}
              download={`qr-${session.user.memberId}.png`}
            >
              <Download className="h-4 w-4" />
              {t("download")}
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("warning")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
