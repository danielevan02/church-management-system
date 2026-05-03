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
import { formatJakarta, toJakartaDateInput } from "@/lib/datetime";
import { useRouter } from "@/lib/i18n/navigation";
import {
  givingEntryInputSchema,
  type GivingEntryInput,
} from "@/lib/validation/giving";

const NONE_SERVICE = "_none";

const RUPIAH_FORMATTER = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function formatAmountDisplay(raw: string): string {
  if (!raw) return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `Rp ${RUPIAH_FORMATTER.format(n)}`;
}

type FundOption = { id: string; name: string };
type ServiceOption = {
  id: string;
  name: string;
  startsAt: Date;
};

type FormValues = {
  serviceId: string;
  fundId: string;
  amount: string;
  receivedAt: string;
  notes: string;
};

function emptyDefaults(): FormValues {
  return {
    serviceId: NONE_SERVICE,
    fundId: "",
    amount: "",
    receivedAt: toJakartaDateInput(new Date()),
    notes: "",
  };
}

function toGivingInput(values: FormValues): GivingEntryInput {
  return {
    serviceId: values.serviceId === NONE_SERVICE ? "" : values.serviceId,
    fundId: values.fundId,
    amount: values.amount,
    receivedAt: values.receivedAt,
    notes: values.notes,
  };
}

type Props = {
  funds: FundOption[];
  services: ServiceOption[];
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (input: GivingEntryInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function GivingForm({
  funds,
  services,
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("giving.record.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(givingEntryInputSchema as never),
    defaultValues: { ...emptyDefaults(), ...initialValues },
    mode: "onSubmit",
  });

  function handleServiceChange(value: string) {
    form.setValue("serviceId", value);
    if (value !== NONE_SERVICE) {
      const service = services.find((s) => s.id === value);
      if (service) {
        form.setValue("receivedAt", toJakartaDateInput(service.startsAt));
      }
    }
  }

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
            name="serviceId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.service")}</FormLabel>
                <Select onValueChange={handleServiceChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("fields.servicePlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_SERVICE}>
                      {t("fields.serviceNone")}
                    </SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ·{" "}
                        {formatJakarta(s.startsAt, "dd MMM yyyy HH:mm")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t("fields.serviceHelp")}</FormDescription>
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
                  <DatePicker
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    ariaLabel={t("fields.receivedAt")}
                  />
                </FormControl>
                <FormDescription>{t("fields.receivedAtHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="Rp 2.500.000"
                    value={formatAmountDisplay(field.value)}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>{t("fields.amountHelp")}</FormDescription>
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
