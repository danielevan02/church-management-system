import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { TemplateEditForm } from "./template-edit-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getTemplate } from "@/server/queries/communications";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tpl = await getTemplate(id);
  if (!tpl) notFound();

  const t = await getTranslations("communications.template");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/communications/templates">
            <ArrowLeft className="h-4 w-4" />
            {tpl.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("edit.title")}</h1>
      </header>
      <TemplateEditForm
        id={id}
        submitLabel={t("edit.submit")}
        initialValues={{
          name: tpl.name,
          channel: tpl.channel,
          subject: tpl.subject ?? "",
          body: tpl.body,
          isActive: tpl.isActive,
        }}
      />
    </div>
  );
}
