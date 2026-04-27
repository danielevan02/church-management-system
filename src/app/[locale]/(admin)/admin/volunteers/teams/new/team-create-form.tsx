"use client";

import { TeamForm } from "@/components/admin/volunteers/team-form";
import { useRouter } from "@/lib/i18n/navigation";
import { createTeamAction } from "@/server/actions/volunteers/teams";

export function TeamCreateForm({ submitLabel }: { submitLabel: string }) {
  const router = useRouter();
  return (
    <TeamForm
      submitLabel={submitLabel}
      onSubmit={createTeamAction}
      onSuccess={(result) => {
        if (result.id) router.push(`/admin/volunteers/teams/${result.id}`);
      }}
    />
  );
}
