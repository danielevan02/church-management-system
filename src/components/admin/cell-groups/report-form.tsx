"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import {
  cellGroupReportInputSchema,
  type CellGroupReportInput,
} from "@/lib/validation/cell-group";
import { createCellGroupReportAction } from "@/server/actions/cell-groups/reports";

type FormValues = {
  meetingDate: string;
  attendeeCount: number;
  visitorCount: number;
  topic: string;
  notes: string;
};

const defaults: FormValues = {
  meetingDate: new Date().toISOString().slice(0, 10),
  attendeeCount: 0,
  visitorCount: 0,
  topic: "",
  notes: "",
};

function toInput(values: FormValues): CellGroupReportInput {
  return {
    meetingDate: values.meetingDate,
    attendeeCount: values.attendeeCount,
    visitorCount: values.visitorCount,
    topic: values.topic,
    notes: values.notes,
  };
}

export function CellGroupReportForm({ cellGroupId }: { cellGroupId: string }) {
  const t = useTranslations("cellGroups.report");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(cellGroupReportInputSchema as never),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createCellGroupReportAction(cellGroupId, toInput(values));
      if (result.ok) {
        toast.success(t("savedToast"));
        router.push(`/admin/cell-groups/${cellGroupId}`);
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
            name="meetingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.meetingDate")} *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel={t("fields.meetingDate")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attendeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.attendeeCount")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visitorCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.visitorCount")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.topic")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.notes")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
