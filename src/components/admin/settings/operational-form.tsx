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
  operationalSettingsSchema,
  type OperationalSettingsInput,
} from "@/lib/validation/settings";
import { updateOperationalSettingsAction } from "@/server/actions/settings";

type FormValues = {
  bankAccountHolder: string;
  bankAccountNumber: string;
  qrisImagePath: string;
  confirmationWhatsApp: string;
};

export function OperationalSettingsForm({
  initialValues,
  envFallbacks,
}: {
  initialValues: FormValues;
  envFallbacks: FormValues;
}) {
  const t = useTranslations("settings.operational");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(operationalSettingsSchema as never),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const input: OperationalSettingsInput = values;
      const result = await updateOperationalSettingsAction(input);
      if (result.ok) {
        toast.success(t("savedToast"));
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

  function placeholder(field: keyof FormValues): string | undefined {
    const v = envFallbacks[field];
    return v ? t("envFallback", { value: v }) : undefined;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="bankAccountHolder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.bankAccountHolder")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={placeholder("bankAccountHolder")} />
                </FormControl>
                <FormDescription>{t("fields.bankAccountHolderHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.bankAccountNumber")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={placeholder("bankAccountNumber")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="qrisImagePath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.qrisImagePath")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={placeholder("qrisImagePath") ?? "/qris.png"} />
                </FormControl>
                <FormDescription>{t("fields.qrisImagePathHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmationWhatsApp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.confirmationWhatsApp")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={placeholder("confirmationWhatsApp") ?? "+62…"}
                  />
                </FormControl>
                <FormDescription>{t("fields.confirmationWhatsAppHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
