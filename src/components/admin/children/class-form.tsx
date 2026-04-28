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
import { useRouter } from "@/lib/i18n/navigation";
import {
  childClassInputSchema,
  type ChildClassInput,
} from "@/lib/validation/children";

type FormValues = {
  name: string;
  ageMin: number;
  ageMax: number;
  isActive: boolean;
};

const defaults: FormValues = {
  name: "",
  ageMin: 0,
  ageMax: 5,
  isActive: true,
};

type Props = {
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (input: ChildClassInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function ChildClassForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("children.classForm");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(childClassInputSchema as never),
    defaultValues: { ...defaults, ...initialValues },
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const input: ChildClassInput = {
        name: values.name,
        ageMin: values.ageMin,
        ageMax: values.ageMax,
        isActive: values.isActive,
      };
      const result = await onSubmit(input);
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
            name="ageMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.ageMin")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={18}
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
            name="ageMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.ageMax")} *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={18}
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 space-y-0 md:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="grid gap-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("fields.isActive")}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t("fields.isActiveHint")}
                  </p>
                </div>
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
