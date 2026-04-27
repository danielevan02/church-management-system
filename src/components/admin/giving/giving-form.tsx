"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MemberPicker } from "./member-picker";
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
  givingInputSchema,
  type GivingInput,
} from "@/lib/validation/giving";

type FundOption = { id: string; name: string };

type FormValues = {
  fundId: string;
  memberId: string;
  giverName: string;
  giverPhone: string;
  giverEmail: string;
  amount: string;
  method:
    | "QRIS"
    | "BANK_TRANSFER"
    | "EWALLET"
    | "CASH"
    | "CARD"
    | "OTHER";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  receivedAt: string;
  externalRef: string;
  notes: string;
};

function emptyDefaults(): FormValues {
  return {
    fundId: "",
    memberId: "",
    giverName: "",
    giverPhone: "",
    giverEmail: "",
    amount: "",
    method: "BANK_TRANSFER",
    status: "COMPLETED",
    receivedAt: new Date().toISOString().slice(0, 10),
    externalRef: "",
    notes: "",
  };
}

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...emptyDefaults(), ...initial };
}

function toGivingInput(values: FormValues): GivingInput {
  return {
    fundId: values.fundId,
    memberId: values.memberId === "" ? undefined : values.memberId,
    giverName: values.giverName,
    giverPhone: values.giverPhone,
    giverEmail: values.giverEmail,
    amount: values.amount,
    method: values.method,
    status: values.status,
    receivedAt: values.receivedAt,
    externalRef: values.externalRef,
    notes: values.notes,
  };
}

type Props = {
  funds: FundOption[];
  initialValues?: Partial<FormValues>;
  initialMemberName?: string | null;
  submitLabel: string;
  onSubmit: (input: GivingInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function GivingForm({
  funds,
  initialValues,
  initialMemberName,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("giving.record.form");
  const tMethod = useTranslations("giving.method");
  const tStatus = useTranslations("giving.status");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedMemberName, setPickedMemberName] = useState<string | null>(
    initialMemberName ?? null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(givingInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await onSubmit(toGivingInput(values));
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
            name="fundId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.fund")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.fundPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {funds.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.amount")} *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="100000"
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("fields.amountHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.member")}</FormLabel>
                <FormControl>
                  <MemberPicker
                    value={field.value === "" ? null : field.value}
                    initialName={pickedMemberName}
                    placeholder={t("fields.memberPlaceholder")}
                    onChange={(id, name) => {
                      field.onChange(id ?? "");
                      setPickedMemberName(name);
                      if (id) {
                        form.setValue("giverName", "");
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>{t("fields.memberHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="giverName"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.giverName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("fields.giverNamePlaceholder")}
                  />
                </FormControl>
                <FormDescription>{t("fields.giverNameHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="giverPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.giverPhone")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="08xxxxxxxxxx" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="giverEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.giverEmail")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.method")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">
                      {tMethod("bankTransfer")}
                    </SelectItem>
                    <SelectItem value="QRIS">{tMethod("qris")}</SelectItem>
                    <SelectItem value="EWALLET">{tMethod("ewallet")}</SelectItem>
                    <SelectItem value="CASH">{tMethod("cash")}</SelectItem>
                    <SelectItem value="CARD">{tMethod("card")}</SelectItem>
                    <SelectItem value="OTHER">{tMethod("other")}</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="COMPLETED">{tStatus("completed")}</SelectItem>
                    <SelectItem value="PENDING">{tStatus("pending")}</SelectItem>
                    <SelectItem value="FAILED">{tStatus("failed")}</SelectItem>
                    <SelectItem value="REFUNDED">{tStatus("refunded")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receivedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.receivedAt")} *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalRef"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.externalRef")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="BCA-20251215-001" />
                </FormControl>
                <FormDescription>{t("fields.externalRefHelp")}</FormDescription>
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
