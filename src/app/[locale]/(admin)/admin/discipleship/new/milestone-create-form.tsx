"use client";

import { MilestoneForm } from "@/components/admin/discipleship/milestone-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createMilestoneAction } from "@/server/actions/discipleship/milestones";

export function MilestoneCreateForm({
  submitLabel,
  initialMemberId,
}: {
  submitLabel: string;
  initialMemberId?: string;
}) {
  const router = useRouter();
  return (
    <MilestoneForm
      submitLabel={submitLabel}
      initialValues={initialMemberId ? { memberId: initialMemberId } : undefined}
      onSubmit={createMilestoneAction}
      onSuccess={() => router.push("/admin/discipleship")}
    />
  );
}
