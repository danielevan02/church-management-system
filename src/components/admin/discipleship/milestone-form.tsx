"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
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
  milestoneInputSchema,
  type MilestoneInput,
  type MilestoneType,
} from "@/lib/validation/discipleship";

const TYPES: MilestoneType[] = [
  "DECISION_TO_FOLLOW",
  "BAPTISM",
  "MEMBERSHIP",
  "FOUNDATIONS_CLASS",
  "DISCIPLESHIP_CLASS",
  "LEADERSHIP_TRAINING",
  "CELL_GROUP_LEADER",
  "MISSION_TRIP",
  "OTHER",
];

type FormValues = {
  memberId: string;
  type: MilestoneType;
  achievedAt: string;
  notes: string;
};

const defaults: FormValues = {
  memberId: "",
  type: "BAPTISM",
  achievedAt: new Date().toISOString().slice(0, 10),
  notes: "",
};

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...defaults, ...initial };
}

function toInput(values: FormValues): MilestoneInput {
  return {
    memberId: values.memberId,
    type: values.type,
    achievedAt: values.achievedAt,
    notes: values.notes,
  };
}

type Props = {
  initialValues?: Partial<FormValues>;
  initialMemberName?: string | null;
  submitLabel: string;
  lockMember?: boolean;
  onSubmit: (input: MilestoneInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function MilestoneForm({
  initialValues,
  initialMemberName,
  submitLabel,
  lockMember,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("discipleship.form");
  const tType = useTranslations("discipleship.type");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedName, setPickedName] = useState<string | null>(
    initialMemberName ?? null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(milestoneInputSchema as never),
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.type")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {tType(typeKey(type))}
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
            name="achievedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.achievedAt")} *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
            {pending ? `${submitLabel}…` : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function typeKey(type: string): string {
  switch (type) {
    case "DECISION_TO_FOLLOW":
      return "decisionToFollow";
    case "BAPTISM":
      return "baptism";
    case "MEMBERSHIP":
      return "membership";
    case "FOUNDATIONS_CLASS":
      return "foundationsClass";
    case "DISCIPLESHIP_CLASS":
      return "discipleshipClass";
    case "LEADERSHIP_TRAINING":
      return "leadershipTraining";
    case "CELL_GROUP_LEADER":
      return "cellGroupLeader";
    case "MISSION_TRIP":
      return "missionTrip";
    default:
      return "other";
  }
}
