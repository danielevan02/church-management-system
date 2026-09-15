"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { draftAnnouncementAction } from "@/server/actions/ai/draft-announcement";

import type { DraftKind } from "@/lib/ai/announcement-draft-prompt";
import type { AnnouncementDraft } from "@/server/actions/ai/draft-announcement";

const KINDS: readonly DraftKind[] = ["warta", "undangan", "singkat"];
const MAX_NOTES_CHARS = 6_000;

type Props = {
  onApply: (draft: { title: string; body: string }) => void;
};

/**
 * Staff notes in, a reviewable draft out.
 *
 * The draft never reaches the database from here. "Gunakan draf ini" only
 * fills the two form fields the staff member was going to type anyway, so the
 * publish path — with its validation, its role check and its push fan-out to
 * every member — is untouched and still driven by a human pressing Terbitkan.
 */
export function AiDraftDialog({ onApply }: Props) {
  const t = useTranslations("announcements.aiDraft");
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [kind, setKind] = React.useState<DraftKind>("warta");
  const [draft, setDraft] = React.useState<AnnouncementDraft | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const canGenerate = notes.trim().length >= 15 && !isLoading;

  async function generate() {
    if (!canGenerate) return;
    setIsLoading(true);
    setDraft(null);
    try {
      const result = await draftAnnouncementAction({
        notes,
        kind,
        locale: locale === "en" ? "en" : "id",
      });
      if (result.ok) {
        setDraft(result.data);
        return;
      }
      if (result.error === "RATE_LIMITED") {
        toast.error(t("errors.rateLimited", { seconds: result.retryAfter ?? 60 }));
        return;
      }
      if (result.error === "ASSISTANT_UNCONFIGURED") {
        toast.error(t("errors.unconfigured"));
        return;
      }
      toast.error(t("errors.generic"));
    } catch (e) {
      console.error("[aiDraftDialog]", e);
      toast.error(t("errors.generic"));
    } finally {
      setIsLoading(false);
    }
  }

  async function copyWhatsapp() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.whatsapp);
      setCopied(true);
      toast.success(t("copied"));
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard is blocked outside a secure context and in some in-app
      // browsers; the text is on screen and selectable, so say so rather than
      // failing silently.
      toast.error(t("errors.copyFailed"));
    }
  }

  function apply() {
    if (!draft) return;
    onApply({ title: draft.title, body: draft.body });
    toast.success(t("appliedToast"));
    setOpen(false);
  }

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setDraft(null);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Sparkles className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-draft-kind">{t("kindLabel")}</Label>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as DraftKind)}
              disabled={isLoading}
            >
              <SelectTrigger id="ai-draft-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(`kinds.${k}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-draft-notes">{t("notesLabel")}</Label>
            <Textarea
              id="ai-draft-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES_CHARS))}
              placeholder={t("notesPlaceholder")}
              rows={7}
              disabled={isLoading}
            />
            <p className="text-xs text-on-surface-variant">
              {t("notesHint")} · {notes.length}/{MAX_NOTES_CHARS}
            </p>
          </div>

          {draft && (
            <div className="space-y-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  {t("resultTitleLabel")}
                </p>
                <p className="text-base font-semibold text-on-surface">
                  {draft.title}
                </p>
              </div>

              {draft.missingDetails.length > 0 && (
                <div className="flex gap-3 rounded-lg bg-error-container/40 p-3 text-on-error-container">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{t("missingTitle")}</p>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {draft.missingDetails.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Tabs defaultValue="body">
                <TabsList>
                  <TabsTrigger value="body">{t("tabs.body")}</TabsTrigger>
                  <TabsTrigger value="whatsapp">
                    {t("tabs.whatsapp")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="body" className="mt-3">
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-surface p-3 font-sans text-sm text-on-surface">
                    {draft.body}
                  </pre>
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-3 space-y-3">
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-surface p-3 font-sans text-sm text-on-surface">
                    {draft.whatsapp}
                  </pre>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={copyWhatsapp}
                    >
                      {copied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {t("copy")}
                    </Button>
                    <Button asChild type="button" variant="outline" size="sm">
                      {/* No recipient in the link on purpose: WhatsApp then
                          opens its own picker, which is the only way to put
                          this text into a group chat. */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(draft.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Send className="size-4" />
                        {t("sendWhatsapp")}
                      </a>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <p className="text-xs text-on-surface-variant">
                {t("disclaimer")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant={draft ? "outline" : "default"}
            onClick={generate}
            disabled={!canGenerate}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : draft ? (
              <RefreshCw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isLoading
              ? t("generating")
              : draft
                ? t("regenerate")
                : t("generate")}
          </Button>
          {draft && (
            <Button type="button" onClick={apply} className="gap-2">
              <Check className="size-4" />
              {t("apply")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
