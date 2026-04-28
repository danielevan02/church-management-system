"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DateTimePicker } from "@/components/shared/date-time-picker";
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
  serviceInputSchema,
  type ServiceInput,
} from "@/lib/validation/service";

type FormValues = {
  name: string;
  type:
    | "SUNDAY_MORNING"
    | "SUNDAY_EVENING"
    | "MIDWEEK"
    | "YOUTH"
    | "CHILDREN"
    | "SPECIAL"
    | "OTHER";
  startsAt: string;
  durationMin: number;
  location: string;
  notes: string;
  isActive: boolean;
};

const emptyDefaults: FormValues = {
  name: "",
  type: "SUNDAY_MORNING",
  startsAt: "",
  durationMin: 90,
  location: "",
  notes: "",
  isActive: true,
};

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...emptyDefaults, ...initial };
}

function toServiceInput(values: FormValues): ServiceInput {
  return {
    name: values.name,
    type: values.type,
    startsAt: values.startsAt,
    durationMin: values.durationMin,
    location: values.location,
    notes: values.notes,
    isActive: values.isActive,
  };
}

type Props = {
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (input: ServiceInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function ServiceForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("services.form");
  const tType = useTranslations("services.type");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(serviceInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await onSubmit(toServiceInput(values));
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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.name")} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("fields.namePlaceholder")} />
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
                    <SelectItem value="SUNDAY_MORNING">
                      {tType("sundayMorning")}
                    </SelectItem>
                    <SelectItem value="SUNDAY_EVENING">
                      {tType("sundayEvening")}
                    </SelectItem>
                    <SelectItem value="MIDWEEK">{tType("midweek")}</SelectItem>
                    <SelectItem value="YOUTH">{tType("youth")}</SelectItem>
                    <SelectItem value="CHILDREN">{tType("children")}</SelectItem>
                    <SelectItem value="SPECIAL">{tType("special")}</SelectItem>
                    <SelectItem value="OTHER">{tType("other")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.startsAt")} *</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    ariaLabel={t("fields.startsAt")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.durationMin")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={600}
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.location")}</FormLabel>
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
