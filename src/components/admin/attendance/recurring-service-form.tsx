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
  recurringServiceSchema,
  type RecurringServiceInput,
} from "@/lib/validation/service";
import { createRecurringServicesAction } from "@/server/actions/services/create-recurring";

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
  firstDate: string;
  time: string;
  count: number;
  intervalDays: number;
  durationMin: number;
  location: string;
  notes: string;
};

const defaults: FormValues = {
  name: "Kebaktian Minggu Pagi",
  type: "SUNDAY_MORNING",
  firstDate: "",
  time: "09:00",
  count: 12,
  intervalDays: 7,
  durationMin: 90,
  location: "",
  notes: "",
};

function toInput(values: FormValues): RecurringServiceInput {
  return {
    name: values.name,
    type: values.type,
    firstDate: values.firstDate,
    time: values.time,
    count: values.count,
    intervalDays: values.intervalDays,
    durationMin: values.durationMin,
    location: values.location,
    notes: values.notes,
  };
}

export function RecurringServiceForm() {
  const t = useTranslations("services.recurring");
  const tType = useTranslations("services.type");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(recurringServiceSchema as never),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createRecurringServicesAction(toInput(values));
      if (result.ok) {
        toast.success(t("savedToast", { count: result.data.count }));
        router.push("/admin/attendance/services");
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
                  <Input {...field} />
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
            name="firstDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.firstDate")} *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>{t("fields.firstDateHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.time")} *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.count")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{t("fields.countHelp")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="intervalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.intervalDays")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{t("fields.intervalDaysHelp")}</FormDescription>
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
              <FormItem className="md:col-span-2">
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
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
