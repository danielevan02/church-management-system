import { MemberShell } from "@/components/member/member-shell";
import { prisma } from "@/lib/prisma";
import { requireMemberSession } from "@/lib/session";

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

  return <MemberShell member={member}>{children}</MemberShell>;
}
