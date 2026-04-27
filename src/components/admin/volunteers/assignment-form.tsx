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
  assignmentInputSchema,
  type AssignmentInput,
} from "@/lib/validation/volunteer";
import { createAssignmentAction } from "@/server/actions/volunteers/assignments";

type FormValues = {
  teamId: string;
  positionId: string;
  memberId: string;
  serviceDate: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "COMPLETED";
  notes: string;
};

const NONE = "_none";

const defaults: FormValues = {
  teamId: "",
  positionId: "",
  memberId: "",
  serviceDate: new Date().toISOString().slice(0, 10),
  status: "PENDING",
  notes: "",
};

function toInput(values: FormValues): AssignmentInput {
  return {
    teamId: values.teamId,
    positionId: values.positionId,
    memberId: values.memberId,
    serviceDate: values.serviceDate,
    status: values.status,
    notes: values.notes,
  };
}

type Team = {
  id: string;
  name: string;
  positions: Array<{ id: string; name: string; isActive: boolean }>;
};

export function AssignmentForm({
  teams,
  initialTeamId,
  submitLabel,
}: {
  teams: Team[];
  initialTeamId?: string;
  submitLabel: string;
}) {
  const t = useTranslations("volunteers.assignment.form");
  const tStatus = useTranslations("volunteers.assignmentStatus");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedMemberName, setPickedMemberName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(assignmentInputSchema as never),
    defaultValues: { ...defaults, teamId: initialTeamId ?? "" },
    mode: "onSubmit",
  });

  const teamId = form.watch("teamId");
  const team = teams.find((t) => t.id === teamId);
  const positions = team?.positions.filter((p) => p.isActive) ?? [];

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createAssignmentAction(toInput(values));
      if (result.ok) {
        toast.success(t("savedToast"));
        router.push("/admin/volunteers");
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
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.team")} *</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue("positionId", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.teamPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((tm) => (
                      <SelectItem key={tm.id} value={tm.id}>
                        {tm.name}
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
            name="positionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.position")}</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  value={field.value === "" ? NONE : field.value}
                  disabled={positions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>—</SelectItem>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
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
            name="memberId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.member")} *</FormLabel>
                <FormControl>
                  <MemberPicker
                    value={field.value === "" ? null : field.value}
                    initialName={pickedMemberName}
                    placeholder={t("fields.memberPlaceholder")}
                    onChange={(id, name) => {
                      field.onChange(id ?? "");
                      setPickedMemberName(name);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.serviceDate")} *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.status")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDING">{tStatus("pending")}</SelectItem>
                    <SelectItem value="CONFIRMED">{tStatus("confirmed")}</SelectItem>
                    <SelectItem value="DECLINED">{tStatus("declined")}</SelectItem>
                    <SelectItem value="COMPLETED">{tStatus("completed")}</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Textarea {...field} rows={2} />
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
