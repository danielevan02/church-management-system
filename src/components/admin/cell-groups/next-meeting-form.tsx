"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  nextMeetingInputSchema,
  type NextMeetingInput,
} from "@/lib/validation/cell-group";
import { setNextMeetingAction } from "@/server/actions/cell-groups/set-next-meeting";

type FormValues = {
  nextMeetingAt: string;
  nextMeetingLocation: string;
  nextMeetingNotes: string;
};

export function NextMeetingForm({
  cellGroupId,
  hasExisting,
  initialValues,
}: {
  cellGroupId: string;
  hasExisting: boolean;
  initialValues: FormValues;
}) {
  const t = useTranslations("cellGroups.nextMeeting");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(nextMeetingInputSchema as never),
    defaultValues: initialValues,
  });

  function submit(values: FormValues) {
    startTransition(async () => {
      const input: NextMeetingInput = {
        nextMeetingAt:
          values.nextMeetingAt === "" ? null : values.nextMeetingAt,
        nextMeetingLocation: values.nextMeetingLocation,
        nextMeetingNotes: values.nextMeetingNotes,
      };
      const result = await setNextMeetingAction(cellGroupId, input);
      if (result.ok) {
        toast.success(t("savedToast"));
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  function clearMeeting() {
    startTransition(async () => {
      const result = await setNextMeetingAction(cellGroupId, {
        nextMeetingAt: null,
        nextMeetingLocation: "",
        nextMeetingNotes: "",
      });
      if (result.ok) {
        form.reset({
          nextMeetingAt: "",
          nextMeetingLocation: "",
          nextMeetingNotes: "",
        });
        toast.success(t("clearedToast"));
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nextMeetingAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dateLabel")}</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextMeetingLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("locationLabel")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="nextMeetingNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("notesLabel")}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasExisting ? (
            <Button
              type="button"
              variant="ghost"
              onClick={clearMeeting}
              disabled={pending}
            >
              {t("clearButton")}
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? `${t("saveButton")}…` : t("saveButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
