"use client";

import { MemberForm } from "@/components/admin/members/member-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createMemberAction } from "@/server/actions/members/create";

export function MemberCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();

  return (
    <MemberForm
      submitLabel={submitLabel}
      onSubmit={createMemberAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/members/${result.id}`);
      }}
    />
  );
}
