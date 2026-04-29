"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MemberPicker } from "@/components/admin/giving/member-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useRouter } from "@/lib/i18n/navigation";
import {
  userEditSchema,
  type RoleInput,
  type UserEditInput,
} from "@/lib/validation/users";
import { updateUserAction } from "@/server/actions/users";

type FormValues = {
  role: RoleInput;
  isActive: boolean;
  memberId: string;
};

export function UserEditForm({
  id,
  initialValues,
  initialMemberName,
  submitLabel,
  isSelf,
}: {
  id: string;
  initialValues: FormValues;
  initialMemberName: string | null;
  submitLabel: string;
  isSelf: boolean;
}) {
  const t = useTranslations("settings.users.form");
  const tRole = useTranslations("settings.users.roles");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pickedName, setPickedName] = useState<string | null>(initialMemberName);

  const ROLES: RoleInput[] = ["ADMIN", "STAFF", "LEADER", "MEMBER"];

  const form = useForm<FormValues>({
    resolver: zodResolver(userEditSchema as never),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const input: UserEditInput = {
        role: values.role,
        isActive: values.isActive,
        memberId: values.memberId === "" ? undefined : values.memberId,
      };
      const result = await updateUserAction(id, input);
      if (result.ok) {
        toast.success(t("updatedToast"));
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
      toast.error(t(`errors.${result.error}` as never) || t("errorToast"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                {isSelf ? (
                  <FormDescription>{t("fields.roleSelfHint")}</FormDescription>
                ) : null}
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
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 space-y-0 md:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSelf}
                  />
                </FormControl>
                <div className="grid gap-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    {t("fields.isActive")}
                  </FormLabel>
                  <FormDescription>{t("fields.isActiveHint")}</FormDescription>
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

function roleKey(r: RoleInput): string {
  switch (r) {
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
