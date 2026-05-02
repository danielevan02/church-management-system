"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
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
  cellGroupInputSchema,
  type CellGroupInput,
} from "@/lib/validation/cell-group";

type FormValues = {
  name: string;
  description: string;
  leaderId: string;
  parentGroupId: string;
  nextMeetingAt: string;
  nextMeetingLocation: string;
  nextMeetingNotes: string;
  isActive: boolean;
};

const NONE = "_none";

const emptyDefaults: FormValues = {
  name: "",
  description: "",
  leaderId: "",
  parentGroupId: "",
  nextMeetingAt: "",
  nextMeetingLocation: "",
  nextMeetingNotes: "",
  isActive: true,
};

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...emptyDefaults, ...initial };
}

function toCellGroupInput(values: FormValues): CellGroupInput {
  return {
    name: values.name,
    description: values.description,
    leaderId: values.leaderId,
    parentGroupId: values.parentGroupId,
    nextMeetingAt: values.nextMeetingAt === "" ? null : values.nextMeetingAt,
    nextMeetingLocation: values.nextMeetingLocation,
    nextMeetingNotes: values.nextMeetingNotes,
    isActive: values.isActive,
  };
}

type Props = {
  leaders: Array<{ id: string; fullName: string }>;
  parentGroups: Array<{ id: string; name: string }>;
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  canChangeLeader?: boolean;
  onSubmit: (input: CellGroupInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function CellGroupForm({
  leaders,
  parentGroups,
  initialValues,
  submitLabel,
  canChangeLeader = true,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("cellGroups.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(cellGroupInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await onSubmit(toCellGroupInput(values));
      if (result.ok) {
        toast.success(t("savedToast"));
        onSuccess?.({ id: result.data?.id });
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
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.name")} *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leaderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.leader")} *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!canChangeLeader}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.leaderPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leaders.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.parentGroup")}</FormLabel>
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
                    <SelectItem value={NONE}>{t("fields.noParent")}</SelectItem>
                    {parentGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextMeetingAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.nextMeetingAt")}</FormLabel>
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
                <FormLabel>{t("fields.nextMeetingLocation")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nextMeetingNotes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.nextMeetingNotes")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.description")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 md:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>{t("fields.isActive")}</FormLabel>
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
            {pending ? `${submitLabel}…` : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
