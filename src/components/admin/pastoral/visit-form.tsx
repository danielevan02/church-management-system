"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
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
  pastoralVisitInputSchema,
  type PastoralVisitInput,
  type VisitTypeInput,
} from "@/lib/validation/pastoral";

const TYPES: VisitTypeInput[] = ["HOSPITAL", "HOME", "OFFICE", "PHONE", "OTHER"];

type FormValues = {
  memberId: string;
  visitType: VisitTypeInput;
  visitedAt: string;
  notes: string;
  followUp: string;
  followUpDate: string;
};

const defaults: FormValues = {
  memberId: "",
  visitType: "HOME",
  visitedAt: new Date().toISOString().slice(0, 10),
  notes: "",
  followUp: "",
  followUpDate: "",
};

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...defaults, ...initial };
}

function toInput(values: FormValues): PastoralVisitInput {
  return {
    memberId: values.memberId,
    visitType: values.visitType,
    visitedAt: values.visitedAt,
    notes: values.notes,
    followUp: values.followUp,
    followUpDate: values.followUpDate || undefined,
  };
}

type Props = {
  initialValues?: Partial<FormValues>;
  initialMemberName?: string | null;
  submitLabel: string;
  lockMember?: boolean;
  onSubmit: (input: PastoralVisitInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function PastoralVisitForm({
  initialValues,
  initialMemberName,
  submitLabel,
  lockMember,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("pastoral.form");
  const tType = useTranslations("pastoral.visitType");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedName, setPickedName] = useState<string | null>(
    initialMemberName ?? null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(pastoralVisitInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await onSubmit(toInput(values));
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
            name="memberId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.member")} *</FormLabel>
                <FormControl>
                  {lockMember ? (
                    <Input value={pickedName ?? field.value} disabled />
                  ) : (
                    <MemberPicker
                      value={field.value === "" ? null : field.value}
                      initialName={pickedName}
                      placeholder={t("fields.memberPlaceholder")}
                      onChange={(id, name) => {
                        field.onChange(id ?? "");
                        setPickedName(name);
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="visitType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.visitType")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {tType(visitTypeKey(type))}
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
            name="visitedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.visitedAt")} *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel={t("fields.visitedAt")}
                  />
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
                <FormLabel>{t("fields.notes")} *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    placeholder={t("fields.notesPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="followUp"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.followUp")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder={t("fields.followUpPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.followUpDate")}</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    clearable
                    ariaLabel={t("fields.followUpDate")}
                  />
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
            {pending ? `${submitLabel}…` : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function visitTypeKey(type: string): string {
  switch (type) {
    case "HOSPITAL":
      return "hospital";
    case "HOME":
      return "home";
    case "OFFICE":
      return "office";
    case "PHONE":
      return "phone";
    default:
      return "other";
  }
}
