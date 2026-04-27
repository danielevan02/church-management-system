import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { DeleteCampaignButton } from "./delete-campaign-button";
import { SendCampaignButton } from "@/components/admin/communications/send-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import { getCampaign } from "@/server/queries/communications";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const t = await getTranslations("communications.campaign.detail");
  const tChannel = await getTranslations("communications.channel");
  const tStatus = await getTranslations("communications.campaign.status");
  const tDelivery = await getTranslations("communications.delivery.status");

  const isSendable = campaign.status === "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/admin/communications">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {tChannel(campaign.channel.toLowerCase() as never)}
              </Badge>
              <Badge>{tStatus(statusKey(campaign.status))}</Badge>
              {campaign.sentAt ? (
                <>
                  <span>•</span>
                  <span>
                    {t("sentLabel")}:{" "}
                    {format(campaign.sentAt, "dd MMM yyyy, HH:mm")}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeleteCampaignButton id={id} />
            {isSendable ? (
              <SendCampaignButton id={id} totalCount={campaign.totalCount} />
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("statTotal")} value={campaign.totalCount} />
        <StatCard label={t("statSent")} value={campaign.successCount} />
        <StatCard
          label={t("statFailed")}
          value={campaign.failureCount}
          tone={campaign.failureCount > 0 ? "destructive" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("messageTitle")}</CardTitle>
          {campaign.subject ? (
            <CardDescription>
              {t("subjectLabel")}: {campaign.subject}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
            {campaign.body}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("deliveriesTitle")}</CardTitle>
          <CardDescription>
            {t("deliveriesDescription", { count: campaign.messages.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaign.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("deliveriesEmpty")}
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("colRecipient")}</TableHead>
                    <TableHead>{t("colStatus")}</TableHead>
                    <TableHead>{t("colSentAt")}</TableHead>
                    <TableHead>{t("colError")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">
                        {m.recipient}
                      </TableCell>
                      <TableCell>
                        <DeliveryStatusBadge
                          status={m.status}
                          label={tDelivery(m.status.toLowerCase() as never)}
                        />
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">
                        {m.sentAt ? format(m.sentAt, "dd MMM HH:mm:ss") : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {m.errorMessage ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "default" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div
          className={`text-3xl font-bold tabular-nums ${
            tone === "destructive" ? "text-destructive" : ""
          }`}
        >
          {value}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function DeliveryStatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const variant: "default" | "secondary" | "outline" | "destructive" =
    status === "SENT" || status === "DELIVERED"
      ? "default"
      : status === "PENDING"
        ? "outline"
        : "destructive";
  return <Badge variant={variant}>{label}</Badge>;
}

function statusKey(s: string): string {
  switch (s) {
    case "DRAFT":
      return "draft";
    case "SENDING":
      return "sending";
    case "SENT":
      return "sent";
    case "FAILED":
      return "failed";
    default:
      return s.toLowerCase();
  }
}
