"use client";

import { PastoralVisitForm } from "@/components/admin/pastoral/visit-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createPastoralVisitAction } from "@/server/actions/pastoral/visits";

export function VisitCreateForm({
  submitLabel,
  initialMemberId,
  initialMemberName,
}: {
  submitLabel: string;
  initialMemberId?: string;
  initialMemberName?: string | null;
}) {
  const router = useRouter();
  return (
    <PastoralVisitForm
      submitLabel={submitLabel}
      initialValues={initialMemberId ? { memberId: initialMemberId } : undefined}
      initialMemberName={initialMemberName}
      onSubmit={createPastoralVisitAction}
      onSuccess={() => router.push("/admin/pastoral")}
    />
  );
}
