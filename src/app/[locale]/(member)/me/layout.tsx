import type { Metadata, Viewport } from "next";

import { InstallPrompt } from "@/components/member/install-prompt";
import { MemberHeader } from "@/components/member/member-header";
import { MemberSidebar } from "@/components/member/member-sidebar";
import { PushBanner } from "@/components/member/push-banner";
import { PwaRegister } from "@/components/member/pwa-register";
import { SidebarAutoCloseMobile } from "@/components/shared/sidebar-autoclose-mobile";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { church } from "@/config/church";
import { prisma } from "@/lib/prisma";
import { requireMemberSession } from "@/lib/session";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: church.shortName,
  },
};

export const viewport: Viewport = {
  themeColor: church.primaryColor,
};

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireMemberSession();
  const member = session.user.memberId
    ? await prisma.member.findUnique({
        where: { id: session.user.memberId },
        select: { firstName: true, fullName: true, photoUrl: true },
      })
    : null;

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <MemberSidebar member={member} variant="inset" />
        <SidebarInset className="min-w-0">
          <MemberHeader />
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <InstallPrompt />
            <PushBanner />
            {children}
          </div>
        </SidebarInset>
        <SidebarAutoCloseMobile />
      </SidebarProvider>
      <PwaRegister />
    </>
  );
}
