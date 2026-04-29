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
import { useRouter } from "@/lib/i18n/navigation";
import {
  type MemberInput,
  memberInputSchema,
} from "@/lib/validation/member";

type FormValues = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;
  maritalStatus: "" | "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  status: "ACTIVE" | "INACTIVE" | "TRANSFERRED" | "DECEASED" | "VISITOR";
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  baptismDate: string;
  baptismChurch: string;
  joinedAt: string;
  notes: string;
};

const emptyDefaults: FormValues = {
  firstName: "",
  lastName: "",
  nickname: "",
  email: "",
  phone: "",
  gender: "MALE",
  birthDate: "",
  maritalStatus: "",
  status: "ACTIVE",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  country: "ID",
  baptismDate: "",
  baptismChurch: "",
  joinedAt: "",
  notes: "",
};

function toFormValues(
  initial: Partial<FormValues> | undefined,
): FormValues {
  return { ...emptyDefaults, ...initial };
}

function toMemberInput(values: FormValues): MemberInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    nickname: values.nickname,
    email: values.email,
    phone: values.phone,
    gender: values.gender,
    birthDate: values.birthDate,
    maritalStatus:
      values.maritalStatus === "" ? null : values.maritalStatus,
    status: values.status,
    address: values.address,
    city: values.city,
    province: values.province,
    postalCode: values.postalCode,
    country: values.country,
    baptismDate: values.baptismDate,
    baptismChurch: values.baptismChurch,
    joinedAt: values.joinedAt,
    notes: values.notes,
  };
}

type Props = {
  initialValues?: Partial<FormValues>;
  submitLabel: string;
  onSubmit: (input: MemberInput) => Promise<
    | { ok: true; data?: { id: string } }
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  >;
  onSuccess?: (result: { id?: string }) => void;
};

export function MemberForm({
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: Props) {
  const t = useTranslations("members.form");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(memberInputSchema as never),
    defaultValues: toFormValues(initialValues),
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await onSubmit(toMemberInput(values));
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Section title={t("sections.identity")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.firstName")} *</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="given-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="family-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.nickname")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.gender")} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">{t("gender.male")}</SelectItem>
                      <SelectItem value="FEMALE">
                        {t("gender.female")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.birthDate")}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      clearable
                      ariaLabel={t("fields.birthDate")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.maritalStatus")}</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "_" ? "" : v)}
                    value={field.value === "" ? "_" : field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="_">—</SelectItem>
                      <SelectItem value="SINGLE">
                        {t("marital.single")}
                      </SelectItem>
                      <SelectItem value="MARRIED">
                        {t("marital.married")}
                      </SelectItem>
                      <SelectItem value="DIVORCED">
                        {t("marital.divorced")}
                      </SelectItem>
                      <SelectItem value="WIDOWED">
                        {t("marital.widowed")}
                      </SelectItem>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        {t("status.active")}
                      </SelectItem>
                      <SelectItem value="VISITOR">
                        {t("status.visitor")}
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        {t("status.inactive")}
                      </SelectItem>
                      <SelectItem value="TRANSFERRED">
                        {t("status.transferred")}
                      </SelectItem>
                      <SelectItem value="DECEASED">
                        {t("status.deceased")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title={t("sections.contact")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.phone")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="08xxxxxxxxxx"
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormDescription>{t("fields.phoneHelp")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title={t("sections.address")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("fields.address")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.city")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.province")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.postalCode")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.country")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title={t("sections.church")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="joinedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.joinedAt")}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      clearable
                      ariaLabel={t("fields.joinedAt")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baptismDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.baptismDate")}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      clearable
                      ariaLabel={t("fields.baptismDate")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baptismChurch"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("fields.baptismChurch")}</FormLabel>
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
