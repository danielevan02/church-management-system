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
  templateInputSchema,
  type TemplateInput,
} from "@/lib/validation/communications";

type FormValues = {
  name: string;
  channel: "WHATSAPP" | "EMAIL" | "SMS" | "PUSH";
  subject: string;
  body: string;
  isActive: boolean;
};

const emptyDefaults: FormValues = {
  name: "",
  channel: "WHATSAPP",
  subject: "",
  body: "",
  isActive: true,
};

function toFormValues(initial: Partial<FormValues> | undefined): FormValues {
  return { ...emptyDefaults, ...initial };
}

function toInput(values: FormValues): TemplateInput {
  return {
    name: values.name,
    channel: values.channel,
    subject: values.subject,
    body: values.body,
    isActive: values.isActive,
  };
}

type Props = {
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (input: TemplateInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function TemplateForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("communications.template.form");
  const tChannel = useTranslations("communications.channel");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(templateInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  const channel = form.watch("channel");
  const showSubject = channel === "EMAIL";

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
            name="name"
            render={({ field }) => (
              <FormItem>
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
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.channel")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">{tChannel("whatsapp")}</SelectItem>
                    <SelectItem value="EMAIL">{tChannel("email")}</SelectItem>
                    <SelectItem value="SMS">{tChannel("sms")}</SelectItem>
                    <SelectItem value="PUSH">{tChannel("push")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {showSubject ? (
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("fields.subject")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("fields.body")} *</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={8} />
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
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
