"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  createAssignmentAction,
  type WeekConflict,
} from "@/server/actions/volunteers/assignments";
import {
  getWeekAssignmentsAction,
  type WeekAssignmentItem,
} from "@/server/actions/volunteers/get-week-assignments";

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
  const [conflict, setConflict] = useState<{
    info: WeekConflict;
    pendingValues: FormValues;
  } | null>(null);
  const [weekBusy, setWeekBusy] = useState<WeekAssignmentItem[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(assignmentInputSchema as never),
    defaultValues: { ...defaults, teamId: initialTeamId ?? "" },
    mode: "onSubmit",
  });

  const teamId = form.watch("teamId");
  const team = teams.find((t) => t.id === teamId);
  const positions = team?.positions.filter((p) => p.isActive) ?? [];
  const serviceDate = form.watch("serviceDate");
  const memberId = form.watch("memberId");

  useEffect(() => {
    if (!serviceDate) {
      setWeekBusy([]);
      return;
    }
    let cancelled = false;
    getWeekAssignmentsAction(serviceDate).then((r) => {
      if (cancelled) return;
      setWeekBusy(r.ok ? r.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceDate]);

  const pickedMemberWeekConflict = memberId
    ? weekBusy.find((b) => b.memberId === memberId)
    : null;

  function submit(values: FormValues, options?: { forceAssign?: boolean }) {
    startTransition(async () => {
      const result = await createAssignmentAction(toInput(values), options);
      if (result.ok) {
        toast.success(t("savedToast"));
        router.push("/admin/volunteers");
        return;
      }
      if (result.error === "WEEK_CONFLICT" && result.conflict) {
        setConflict({ info: result.conflict, pendingValues: values });
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

  function handleSubmit(values: FormValues) {
    submit(values);
  }

  function handleForceAssign() {
    if (!conflict) return;
    const values = conflict.pendingValues;
    setConflict(null);
    submit(values, { forceAssign: true });
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
                {pickedMemberWeekConflict ? (
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                      {t("conflictHint", {
                        teamName: pickedMemberWeekConflict.teamName,
                        positionLabel: pickedMemberWeekConflict.positionName
                          ? ` (${pickedMemberWeekConflict.positionName})`
                          : "",
                      })}
                    </span>
                  </p>
                ) : null}
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
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel={t("fields.serviceDate")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {weekBusy.length > 0 ? (
            <div className="md:col-span-2 flex flex-col gap-2 rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t("alreadyScheduled", { count: weekBusy.length })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {weekBusy.map((b) => (
                  <Badge
                    key={b.id}
                    variant="outline"
                    className="text-[11px] font-normal"
                  >
                    <span className="font-medium">{b.memberName}</span>
                    <span className="text-muted-foreground">
                      &nbsp;·&nbsp;{b.teamName}
                      {b.positionName ? ` (${b.positionName})` : ""}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
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

      <Dialog
        open={conflict !== null}
        onOpenChange={(open) => {
          if (!open) setConflict(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("conflict.title")}</DialogTitle>
            <DialogDescription>
              {t("conflict.description", {
                memberName: pickedMemberName ?? "—",
                teamName: conflict?.info.existingTeamName ?? "",
                positionLabel: conflict?.info.existingPositionName
                  ? ` (${conflict.info.existingPositionName})`
                  : "",
                date: conflict?.info.existingServiceDate
                  ? format(
                      new Date(conflict.info.existingServiceDate),
                      "EEEE, dd MMM yyyy",
                    )
                  : "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConflict(null)}
              disabled={pending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleForceAssign}
              disabled={pending}
            >
              {t("conflict.forceAssign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
