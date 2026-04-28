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
import { useRouter } from "@/lib/i18n/navigation";
import {
  userCreateSchema,
  type RoleInput,
  type UserCreateInput,
} from "@/lib/validation/users";
import { createUserAction } from "@/server/actions/users";

type FormValues = {
  email: string;
  password: string;
  role: RoleInput;
  memberId: string;
};

const defaults: FormValues = {
  email: "",
  password: "",
  role: "STAFF",
  memberId: "",
};

export function UserCreateForm({
  submitLabel,
  allowSuperAdmin,
}: {
  submitLabel: string;
  allowSuperAdmin: boolean;
}) {
  const t = useTranslations("settings.users.form");
  const tRole = useTranslations("settings.users.roles");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedName, setPickedName] = useState<string | null>(null);

  const ROLES: RoleInput[] = allowSuperAdmin
    ? ["SUPER_ADMIN", "ADMIN", "STAFF", "LEADER", "MEMBER"]
    : ["ADMIN", "STAFF", "LEADER", "MEMBER"];

  const form = useForm<FormValues>({
    resolver: zodResolver(userCreateSchema as never),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const input: UserCreateInput = {
        email: values.email,
        password: values.password,
        role: values.role,
        memberId: values.memberId === "" ? undefined : values.memberId,
      };
      const result = await createUserAction(input);
      if (result.ok) {
        toast.success(t("createdToast"));
        router.push("/admin/settings/users");
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.email")} *</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.password")} *</FormLabel>
                <FormControl>
                  <Input type="password" {...field} autoComplete="new-password" />
                </FormControl>
                <FormDescription>{t("fields.passwordHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.role")} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {tRole(roleKey(r))}
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
              <FormItem>
                <FormLabel>{t("fields.linkMember")}</FormLabel>
                <FormControl>
                  <MemberPicker
                    value={field.value === "" ? null : field.value}
                    initialName={pickedName}
                    placeholder={t("fields.linkMemberPlaceholder")}
                    onChange={(id, name) => {
                      field.onChange(id ?? "");
                      setPickedName(name);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("fields.linkMemberHint")}</FormDescription>
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

function roleKey(r: RoleInput): string {
  switch (r) {
    case "SUPER_ADMIN":
      return "superAdmin";
    case "ADMIN":
      return "admin";
    case "STAFF":
      return "staff";
    case "LEADER":
      return "leader";
    default:
      return "member";
  }
}
