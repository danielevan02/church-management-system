import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { DevotionalForm } from "@/components/admin/devotionals/devotional-form";
import { DeleteDevotionalButton } from "./delete-devotional-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { toJakartaInput } from "@/lib/datetime";
import { Link } from "@/lib/i18n/navigation";
import { hasAtLeastRole } from "@/lib/permissions";
import { updateDevotionalAction } from "@/server/actions/devotionals";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/devotionals">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {devotional.title}
          </h1>
        </div>
        <DeleteDevotionalButton id={id} />
      </header>

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
