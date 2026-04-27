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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/lib/i18n/navigation";
import {
  guestRsvpInputSchema,
  type GuestRsvpInput,
} from "@/lib/validation/event";
import { adminGuestRsvpAction } from "@/server/actions/events/rsvp";

type FormValues = {
  guestName: string;
  guestPhone: string;
  guestCount: number;
  status: "GOING" | "MAYBE" | "NOT_GOING" | "WAITLIST";
  notes: string;
};

const defaults: FormValues = {
  guestName: "",
  guestPhone: "",
  guestCount: 1,
  status: "GOING",
  notes: "",
};

function toInput(values: FormValues): GuestRsvpInput {
  return {
    guestName: values.guestName,
    guestPhone: values.guestPhone,
    guestCount: values.guestCount,
    status: values.status,
    notes: values.notes,
  };
}

export function GuestRsvpForm({ eventId }: { eventId: string }) {
  const t = useTranslations("events.detail.guestForm");
  const tStatus = useTranslations("events.rsvpStatus");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(guestRsvpInputSchema as never),
    defaultValues: defaults,
    mode: "onSubmit",
  });

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await adminGuestRsvpAction(eventId, toInput(values));
      if (result.ok) {
        toast.success(
          result.data.waitlisted ? t("waitlistedToast") : t("savedToast"),
        );
        form.reset(defaults);
        router.refresh();
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-1 gap-3 md:grid-cols-4"
      >
        <FormField
          control={form.control}
          name="guestName"
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
          name="guestPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.phone")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="08xxxxxxxxxx" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guestCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.count")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.status")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GOING">{tStatus("going")}</SelectItem>
                  <SelectItem value="MAYBE">{tStatus("maybe")}</SelectItem>
                  <SelectItem value="NOT_GOING">
                    {tStatus("notGoing")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel>{t("fields.notes")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
