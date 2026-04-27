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
import {
  type OwnProfileInput,
  ownProfileSchema,
} from "@/lib/validation/own-profile";
import { updateOwnProfileAction } from "@/server/actions/me/update-profile";

type FormValues = {
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  maritalStatus: "" | "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  excludeFromBroadcasts: boolean;
};

function toInput(values: FormValues): OwnProfileInput {
  return {
    phone: values.phone,
    address: values.address,
    city: values.city,
    province: values.province,
    postalCode: values.postalCode,
    country: values.country,
    maritalStatus:
      values.maritalStatus === "" ? null : values.maritalStatus,
    excludeFromBroadcasts: values.excludeFromBroadcasts,
  };
}

export function ProfileEditForm({
  initialValues,
}: {
  initialValues: FormValues;
}) {
  const t = useTranslations("memberPortal.profile");
  const tForm = useTranslations("members.form");
  const tMarital = useTranslations("members.form.marital");
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(ownProfileSchema as never),
    defaultValues: initialValues,
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateOwnProfileAction(toInput(values));
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tForm("fields.phone")}</FormLabel>
              <FormControl>
                <Input {...field} type="tel" placeholder="08xxxxxxxxxx" />
              </FormControl>
              <FormDescription>{tForm("fields.phoneHelp")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tForm("fields.address")}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("fields.city")}</FormLabel>
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
                <FormLabel>{tForm("fields.province")}</FormLabel>
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
                <FormLabel>{tForm("fields.postalCode")}</FormLabel>
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
                <FormLabel>{tForm("fields.country")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tForm("fields.maritalStatus")}</FormLabel>
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
                  <SelectItem value="SINGLE">{tMarital("single")}</SelectItem>
                  <SelectItem value="MARRIED">{tMarital("married")}</SelectItem>
                  <SelectItem value="DIVORCED">
                    {tMarital("divorced")}
                  </SelectItem>
                  <SelectItem value="WIDOWED">{tMarital("widowed")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excludeFromBroadcasts"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div>
                <FormLabel>
                  {tForm("fields.excludeFromBroadcasts")}
                </FormLabel>
                <FormDescription>
                  {tForm("fields.excludeFromBroadcastsHelp")}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
