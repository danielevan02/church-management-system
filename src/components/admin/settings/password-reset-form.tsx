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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  passwordResetSchema,
  type PasswordResetInput,
} from "@/lib/validation/users";
import { resetPasswordAction } from "@/server/actions/users/reset-password";

type FormValues = { password: string };

export function PasswordResetForm({ id }: { id: string }) {
  const t = useTranslations("settings.users.passwordReset");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordResetSchema as never),
    defaultValues: { password: "" },
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const input: PasswordResetInput = { password: values.password };
      const result = await resetPasswordAction(id, input);
      if (result.ok) {
        toast.success(t("savedToast"));
        form.reset({ password: "" });
        return;
      }
      if (result.fieldErrors?.password?.[0]) {
        form.setError("password", {
          type: "server",
          message: result.fieldErrors.password[0],
        });
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("label")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending ? `${t("submit")}…` : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
