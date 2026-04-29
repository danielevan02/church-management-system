"use client";

import { CheckCircle2, Search, ScanLine, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { QrScanner } from "@/components/shared/qr-scanner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/lib/i18n/navigation";
import {
  checkInByQrAction,
  checkInMemberAction,
  checkInVisitorAction,
} from "@/server/actions/attendance/check-in";
import { searchMembersAction } from "@/server/actions/members/search";
import { formatJakarta } from "@/lib/datetime";

type RecentRow = {
  recordId: string;
  name: string;
  source: string;
  alreadyCheckedIn: boolean;
  at: Date;
};

export function CheckInConsole({
  serviceId,
  initialRecent = [],
}: {
  serviceId: string;
  initialRecent?: RecentRow[];
}) {
  const t = useTranslations("attendance.checkIn");
  const router = useRouter();
  const [recent, setRecent] = useState<RecentRow[]>(initialRecent);
  const [tab, setTab] = useState("qr");
  const [isQrPending, startQr] = useTransition();

  const handleSuccess = useCallback(
    (
      result: {
        recordId: string;
        memberId: string | null;
        memberName: string | null;
        alreadyCheckedIn: boolean;
      },
      source: string,
      fallbackName?: string,
    ) => {
      const name = result.memberName ?? fallbackName ?? "—";
      setRecent((prev) => {
        const newRow = {
          recordId: result.recordId,
          name,
          source,
          alreadyCheckedIn: result.alreadyCheckedIn,
          at: new Date(),
        };
        return [
          newRow,
          ...prev.filter((r) => r.recordId !== newRow.recordId),
        ].slice(0, 20);
      });
      if (result.alreadyCheckedIn) {
        toast.info(t("alreadyCheckedIn", { name }));
      } else {
        toast.success(t("checkedIn", { name }));
      }
      router.refresh();
    },
    [router, t],
  );

  const onQrScan = useCallback(
    (token: string) => {
      if (isQrPending) return;
      startQr(async () => {
        const result = await checkInByQrAction({ serviceId, token });
        if (!result.ok) {
          toast.error(errorMessage(result.error, t));
          return;
        }
        handleSuccess(result.data, "qr_usher");
      });
    },
    [serviceId, t, handleSuccess, isQrPending],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList>
              <TabsTrigger value="qr">
                <ScanLine className="h-4 w-4" />
                {t("tabQr")}
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4" />
                {t("tabSearch")}
              </TabsTrigger>
              <TabsTrigger value="visitor">
                <UserPlus className="h-4 w-4" />
                {t("tabVisitor")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qr" className="mt-4">
              <QrScanner onScan={onQrScan} paused={tab !== "qr"} />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("qrHelp")}
              </p>
            </TabsContent>

            <TabsContent value="search" className="mt-4">
              <ManualSearch
                serviceId={serviceId}
                onSuccess={(r, n) => handleSuccess(r, "manual_usher", n)}
              />
            </TabsContent>

            <TabsContent value="visitor" className="mt-4">
              <VisitorForm
                serviceId={serviceId}
                onSuccess={(r, n) => handleSuccess(r, "visitor_usher", n)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentTitle")}</CardTitle>
          <CardDescription>{t("recentDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("recentEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {recent.map((r) => (
                <li
                  key={r.recordId + r.at.toISOString()}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <CheckCircle2
                    className={
                      r.alreadyCheckedIn
                        ? "h-4 w-4 text-muted-foreground"
                        : "h-4 w-4 text-emerald-600"
                    }
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatJakarta(r.at, "HH:mm:ss")} · {r.source}
                      {r.alreadyCheckedIn ? ` · ${t("alreadyTag")}` : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ManualSearch({
  serviceId,
  onSuccess,
}: {
  serviceId: string;
  onSuccess: (
    result: {
      recordId: string;
      memberId: string | null;
      memberName: string | null;
      alreadyCheckedIn: boolean;
    },
    name?: string,
  ) => void;
}) {
  const t = useTranslations("attendance.checkIn");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; fullName: string; phone: string | null }>
  >([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchMembersAction(q).then((r) => {
        if (r.ok) setResults(r.data);
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function pick(memberId: string, name: string) {
    setPendingId(memberId);
    startTransition(async () => {
      const result = await checkInMemberAction({
        serviceId,
        memberId,
        source: "manual_usher",
      });
      setPendingId(null);
      if (!result.ok) {
        toast.error(errorMessage(result.error, t));
        return;
      }
      onSuccess(result.data, name);
      setQ("");
      setResults([]);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
      />
      {q.trim().length > 0 && q.trim().length < 2 ? (
        <p className="text-xs text-muted-foreground">{t("searchMinChars")}</p>
      ) : null}
      {results.length === 0 && q.trim().length >= 2 ? (
        <p className="text-xs text-muted-foreground">{t("searchEmpty")}</p>
      ) : null}
      {results.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {results.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => pick(m.id, m.fullName)}
                disabled={pendingId === m.id}
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-muted disabled:opacity-50"
              >
                <span className="font-medium">{m.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {m.phone ?? "—"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function VisitorForm({
  serviceId,
  onSuccess,
}: {
  serviceId: string;
  onSuccess: (
    result: {
      recordId: string;
      memberId: string | null;
      memberName: string | null;
      alreadyCheckedIn: boolean;
    },
    name?: string,
  ) => void;
}) {
  const t = useTranslations("attendance.checkIn");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await checkInVisitorAction({
        serviceId,
        visitorName: name.trim(),
        visitorPhone: phone,
      });
      if (!result.ok) {
        toast.error(errorMessage(result.error, t));
        return;
      }
      onSuccess(result.data, name.trim());
      setName("");
      setPhone("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("visitorNamePlaceholder")}
        maxLength={120}
      />
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t("visitorPhonePlaceholder")}
        autoComplete="tel"
      />
      <Button type="submit" disabled={pending || !name.trim()}>
        {pending ? `${t("visitorSubmit")}…` : t("visitorSubmit")}
      </Button>
    </form>
  );
}

function errorMessage(code: string, t: ReturnType<typeof useTranslations>): string {
  switch (code) {
    case "INVALID_QR":
      return t("errors.invalidQr");
    case "SERVICE_NOT_FOUND":
      return t("errors.serviceNotFound");
    case "SERVICE_INACTIVE":
      return t("errors.serviceInactive");
    case "CHECK_IN_CLOSED":
      return t("errors.checkInClosed");
    case "MEMBER_NOT_FOUND":
      return t("errors.memberNotFound");
    case "FORBIDDEN":
      return t("errors.forbidden");
    case "VALIDATION_FAILED":
      return t("errors.validation");
    default:
      return t("errors.generic");
  }
}
