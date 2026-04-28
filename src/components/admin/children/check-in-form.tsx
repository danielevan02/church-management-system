"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ChildPicker } from "@/components/admin/children/child-picker";
import { MemberPicker } from "@/components/admin/giving/member-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import { checkInChildAction } from "@/server/actions/children/check-in";

type ChildClass = {
  id: string;
  name: string;
  ageMin: number;
  ageMax: number;
};

export function CheckInForm({ classes }: { classes: ChildClass[] }) {
  const t = useTranslations("children.checkIn.form");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [childId, setChildId] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);
  const [childAge, setChildAge] = useState<number | null>(null);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [guardianName, setGuardianName] = useState<string | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [issuedFor, setIssuedFor] = useState<string | null>(null);

  // Auto-suggest class based on child age
  function suggestedClassId(): string | null {
    if (childAge == null) return null;
    const fit = classes.find(
      (c) => childAge >= c.ageMin && childAge <= c.ageMax,
    );
    return fit?.id ?? null;
  }

  function handleChildChange(id: string | null, name: string | null, age: number | null) {
    setChildId(id);
    setChildName(name);
    setChildAge(age);
    if (id && age != null && classId === "") {
      const fit = classes.find((c) => age >= c.ageMin && age <= c.ageMax);
      if (fit) setClassId(fit.id);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!childId || !guardianId || !classId) {
      toast.error(t("missingFields"));
      return;
    }
    startTransition(async () => {
      const result = await checkInChildAction({
        childId,
        guardianId,
        classId,
        notes,
      });
      if (result.ok) {
        setIssuedCode(result.data.securityCode);
        setIssuedFor(childName);
        // Reset form for next check-in
        setChildId(null);
        setChildName(null);
        setChildAge(null);
        setGuardianId(null);
        setGuardianName(null);
        setClassId("");
        setNotes("");
        toast.success(t("savedToast"));
        router.refresh();
        return;
      }
      if (result.error === "ALREADY_CHECKED_IN") {
        toast.error(t("alreadyCheckedIn"));
        return;
      }
      toast.error(t("errorToast"));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {issuedCode ? (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5" />
              {t("issued.title", { name: issuedFor ?? "" })}
            </CardTitle>
            <CardDescription>{t("issued.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <code className="font-mono text-4xl font-bold tracking-widest tabular-nums">
                {issuedCode}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIssuedCode(null)}
              >
                {t("issued.dismiss")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label className="mb-2 block">{t("fields.child")} *</Label>
            <ChildPicker
              value={childId}
              onChange={handleChildChange}
              placeholder={t("fields.childPlaceholder")}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-2 block">{t("fields.guardian")} *</Label>
            <MemberPicker
              value={guardianId}
              onChange={(id, name) => {
                setGuardianId(id);
                setGuardianName(name);
              }}
              placeholder={t("fields.guardianPlaceholder")}
              initialName={guardianName}
            />
          </div>
          <div>
            <Label className="mb-2 block">{t("fields.class")} *</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder={t("fields.classPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => {
                  const fits =
                    childAge == null
                      ? true
                      : childAge >= c.ageMin && childAge <= c.ageMax;
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.ageMin}–{c.ageMax}){fits ? "" : " ⚠"}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {classId && childAge != null
              ? (() => {
                  const cls = classes.find((c) => c.id === classId);
                  if (!cls) return null;
                  if (childAge < cls.ageMin || childAge > cls.ageMax) {
                    return (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        {t("ageMismatchWarning", { age: childAge })}
                      </p>
                    );
                  }
                  return null;
                })()
              : null}
            {suggestedClassId() && classId === "" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("autoSuggestHint")}
              </p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <Label className="mb-2 block">{t("fields.notes")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t("fields.notesPlaceholder")}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={pending || !childId || !guardianId || !classId}
          >
            {pending ? `${t("submit")}…` : t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}

