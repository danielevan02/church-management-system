"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import {
  campaignInputSchema,
  type CampaignInput,
} from "@/lib/validation/communications";
import { createCampaignAction } from "@/server/actions/communications/campaigns";

type FormValues = {
  name: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS" | "PUSH";
  subject: string;
  body: string;
  audienceKind: "ALL" | "FILTER";
  status: "" | "ACTIVE" | "VISITOR" | "INACTIVE" | "TRANSFERRED" | "DECEASED";
  gender: "" | "MALE" | "FEMALE";
  cellGroupId: string;
  householdId: string;
  templateId: string;
};

const NONE = "_none";

const defaults: FormValues = {
  name: "",
  channel: "WHATSAPP",
  subject: "",
  body: "",
  audienceKind: "ALL",
  status: "",
  gender: "",
  cellGroupId: "",
  householdId: "",
  templateId: "",
};

function toInput(values: FormValues): CampaignInput {
  return {
    name: values.name,
    channel: values.channel,
    subject: values.subject,
    body: values.body,
    audience: {
      kind: values.audienceKind,
      status: values.status === "" ? null : values.status,
      gender: values.gender === "" ? null : values.gender,
      cellGroupId: values.cellGroupId,
      householdId: values.householdId,
    },
  };
}

type Props = {
  templates: Array<{
    id: string;
    name: string;
    channel: string;
    subject: string | null;
    body: string;
  }>;
  cellGroups: Array<{ id: string; name: string }>;
  households: Array<{ id: string; name: string }>;
  submitLabel: string;
};

export function CampaignForm({
  templates,
  cellGroups,
  households,
  submitLabel,
}: Props) {
  const t = useTranslations("communications.campaign.form");
  const tChannel = useTranslations("communications.channel");
  const tStatus = useTranslations("members.form.status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(campaignInputSchema as never),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  const channel = form.watch("channel");
  const audienceKind = form.watch("audienceKind");
  const showSubject = channel === "EMAIL";

  const eligibleTemplates = templates.filter((tpl) => tpl.channel === channel);

  function applyTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    setAppliedTemplateId(id);
    if (tpl.subject) form.setValue("subject", tpl.subject);
    form.setValue("body", tpl.body);
  }

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createCampaignAction(toInput(values));
      if (result.ok) {
        toast.success(t("savedToast"));
        router.push(`/admin/communications/${result.data.id}`);
        return;
      }
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof FormValues, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.name")} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("fields.namePlaceholder")} />
                </FormControl>
                <FormDescription>{t("fields.nameHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.channel")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">{tChannel("whatsapp")}</SelectItem>
                    <SelectItem value="EMAIL">{tChannel("email")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {eligibleTemplates.length > 0 ? (
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("fields.template")}</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      const id = v === NONE ? "" : v;
                      field.onChange(id);
                      if (id) applyTemplate(id);
                    }}
                    value={field.value === "" ? NONE : field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {eligibleTemplates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {appliedTemplateId
                      ? t("fields.templateApplied")
                      : t("fields.templateHelp")}
                  </FormDescription>
                </FormItem>
              )}
            />
          ) : null}
          {showSubject ? (
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("fields.subject")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.body")} *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={8} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-md border p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">{t("audience.title")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("audience.description")}
            </p>
          </div>
          <FormField
            control={form.control}
            name="audienceKind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("audience.kind")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">{t("audience.all")}</SelectItem>
                    <SelectItem value="FILTER">{t("audience.filter")}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {audienceKind === "FILTER" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("audience.status")}</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                      value={field.value === "" ? NONE : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("audience.anyStatus")}</SelectItem>
                        <SelectItem value="ACTIVE">{tStatus("active")}</SelectItem>
                        <SelectItem value="VISITOR">{tStatus("visitor")}</SelectItem>
                        <SelectItem value="INACTIVE">{tStatus("inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("audience.gender")}</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                      value={field.value === "" ? NONE : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("audience.anyGender")}</SelectItem>
                        <SelectItem value="MALE">{t("audience.male")}</SelectItem>
                        <SelectItem value="FEMALE">{t("audience.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {cellGroups.length > 0 ? (
                <FormField
                  control={form.control}
                  name="cellGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("audience.cellGroup")}</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                        value={field.value === "" ? NONE : field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE}>
                            {t("audience.anyCellGroup")}
                          </SelectItem>
                          {cellGroups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              ) : null}
              {households.length > 0 ? (
                <FormField
                  control={form.control}
                  name="householdId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("audience.household")}</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                        value={field.value === "" ? NONE : field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE}>
                            {t("audience.anyHousehold")}
                          </SelectItem>
                          {households.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {t("audience.optOutNote")}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={pending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? `${submitLabel}…` : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
