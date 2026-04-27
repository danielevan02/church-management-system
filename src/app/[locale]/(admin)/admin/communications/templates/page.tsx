import { ArrowLeft, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DeleteTemplateButton } from "@/components/admin/communications/delete-template-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import { listTemplates } from "@/server/queries/communications";

export default async function TemplatesListPage() {
  const t = await getTranslations("communications.template.list");
  const tChannel = await getTranslations("communications.channel");
  const templates = await listTemplates();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/communications">
              <ArrowLeft className="h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { total: templates.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/communications/templates/new">
            <Plus className="h-4 w-4" />
            {t("newButton")}
          </Link>
        </Button>
      </header>

      {templates.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colName")}</TableHead>
                <TableHead>{t("colChannel")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead className="text-right">{t("colActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl.id}>
                  <TableCell>
                    <Link
                      href={`/admin/communications/templates/${tpl.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {tpl.name}
                    </Link>
                    {tpl.subject ? (
                      <div className="text-xs text-muted-foreground">
                        {tpl.subject}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tChannel(tpl.channel.toLowerCase() as never)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tpl.isActive ? "default" : "secondary"}>
                      {tpl.isActive ? t("statusActive") : t("statusInactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteTemplateButton id={tpl.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
