
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/m3/page-header";
import { DevotionalForm } from "@/components/admin/devotionals/devotional-form";
import { DeleteDevotionalButton } from "./delete-devotional-button";

import { auth } from "@/lib/auth";
import { toJakartaInput } from "@/lib/datetime";

import { hasAtLeastRole } from "@/lib/permissions";
import { updateDevotionalAction } from "@/server/actions/devotionals/update";
import { getDevotional } from "@/server/queries/devotionals";

import type { DevotionalInput } from "@/lib/validation/devotional";

export default async function EditDevotionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  if (!hasAtLeastRole(session.user.role, "STAFF")) notFound();

  const { id } = await params;
  const devotional = await getDevotional(id);
  if (!devotional) notFound();

  const t = await getTranslations("devotionals.edit");

  async function update(input: DevotionalInput) {
    "use server";
    return updateDevotionalAction(id, input);
  }

  return (
    <div suppressHydrationWarning data-stagger="sections" className="flex flex-col gap-6">
      <PageHeader
        backHref="/admin/devotionals"
        backLabel={t("backToList")}
        title={devotional.title}
        action={
          <DeleteDevotionalButton id={id} />
        }
      />

      <DevotionalForm
        submitLabel={t("submit")}
        onSubmit={update}
        initialValues={{
          title: devotional.title,
          verseRef: devotional.verseRef ?? "",
          verseText: devotional.verseText ?? "",
          body: devotional.body,
          authorName: devotional.authorName ?? "",
          publishedAt: toJakartaInput(devotional.publishedAt),
        }}
      />
    </div>
  );
}
