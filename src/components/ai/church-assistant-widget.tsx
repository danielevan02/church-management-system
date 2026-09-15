"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  ArrowUp,
  Baby,
  Compass,
  Clock,
  MessageCircle,
  MessagesSquare,
  RotateCcw,
  User,
  Wallet,
  X,
} from "lucide-react";

import { church } from "@/config/church";

import type { LucideIcon } from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  failed?: boolean;
};

/** Order is the answer to "what does someone standing outside the building
 *  need first" — when, then how to arrive, then the children, then the money. */
const OPENERS: { key: string; icon: LucideIcon }[] = [
  { key: "schedule", icon: Clock },
  { key: "firstTime", icon: Compass },
  { key: "portal", icon: User },
  { key: "children", icon: Baby },
  { key: "giving", icon: Wallet },
  { key: "contact", icon: MessagesSquare },
];

const GREETING_ID = "greeting";

/**
 * The server caps history at 24 turns and rejects anything longer outright, so
 * a long conversation is trimmed here rather than being sent and bounced. The
 * greeting is a client-side artefact and is dropped with the rest of the tail.
 */
const MAX_HISTORY = 24;

type AssistantErrorKey = "error" | "errorRateLimited" | "errorUnavailable";

class AssistantError extends Error {
  constructor(readonly messageKey: AssistantErrorKey) {
    super(messageKey);
    this.name = "AssistantError";
  }
}

export function ChurchAssistantWidget() {
  const t = useTranslations("lp.assistant");
  const locale = useLocale();

  const greeting = React.useMemo<ChatMessage>(
    () => ({
      id: GREETING_ID,
      role: "assistant",
      content: t("greeting", { church: church.name }),
    }),
    [t],
  );

  const [isOpen, setIsOpen] = React.useState(false);
  // Kept mounted for the length of the exit animation, which is the entry
  // animation played backwards — see `.sm-bot-panel[data-state="closing"]`.
  const [isClosing, setIsClosing] = React.useState(false);
  const [showTeaser, setShowTeaser] = React.useState(true);
  const [messages, setMessages] = React.useState<ChatMessage[]>([greeting]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const logRef = React.useRef<HTMLDivElement>(null);
  const logEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const launcherRef = React.useRef<HTMLButtonElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const isPristine = messages.length === 1 && messages[0].id === GREETING_ID;

  const openPanel = React.useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const closePanel = React.useCallback(
    (returnFocus = true) => {
      setIsOpen((wasOpen) => {
        if (wasOpen) setIsClosing(true);
        return false;
      });
      if (returnFocus) launcherRef.current?.focus();
    },
    [],
  );

  const scrollToEnd = React.useCallback(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setShowTeaser(false);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // A fresh panel opens at the TOP. Following the tail is right once there is
  // a conversation to follow, but on the greeting it scrolls the welcome — the
  // one thing a first-time visitor is here to read — off the top of the log.
  React.useEffect(() => {
    if (!isOpen) return;
    if (isPristine) {
      if (logRef.current) logRef.current.scrollTop = 0;
      return;
    }
    scrollToEnd();
  }, [messages, isOpen, isPristine, scrollToEnd]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closePanel]);

  // The composer grows with its content; the height cap lives in CSS, so the
  // measurement only has to reset before reading scrollHeight.
  const resizeComposer = React.useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    resizeComposer();
  }, [input, resizeComposer]);

  const send = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isLoading) return;

    setInput("");

    const answerId = `assistant-${Date.now()}`;
    const history: ChatMessage[] = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user", content: query },
    ];

    setMessages([...history, { id: answerId, role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      abortRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: history
            .slice(-MAX_HISTORY)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const code = await response
          .json()
          .then((data: { error?: string }) => data.error)
          .catch(() => undefined);
        throw new AssistantError(
          code === "RATE_LIMITED"
            ? "errorRateLimited"
            : code === "ASSISTANT_UNCONFIGURED" || code === "FEATURE_DISABLED"
              ? "errorUnavailable"
              : "error",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === answerId ? { ...msg, content: answer } : msg,
          ),
        );
      }

      // A model failure that happens after the response headers are sent
      // (quota, safety block, a dropped upstream) closes the stream without a
      // single token and without a non-200 status. Left unhandled the panel
      // sits on a typing indicator for ever, so an empty completion is read as
      // the failure it is.
      if (!answer.trim()) throw new Error("CHAT_EMPTY_STREAM");
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      console.error("[churchAssistant]", err);
      const key =
        err instanceof AssistantError ? err.messageKey : ("error" as const);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === answerId ? { ...msg, content: t(key), failed: true } : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([greeting]);
    setInput("");
    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="sm-bot">
      {(isOpen || isClosing) && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={t("name")}
          className="sm-bot-panel"
          data-state={isClosing ? "closing" : "open"}
          aria-hidden={isClosing || undefined}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && isClosing) setIsClosing(false);
          }}
          data-lenis-prevent
        >
          <header className="sm-bot-head">
            <div className="sm-bot-identity">
              <div className="sm-bot-name-row">
                <h2 className="sm-h4 sm-bot-name">{t("name")}</h2>
                <span className="sm-label sm-bot-tag">{t("tag")}</span>
              </div>
              <p className="sm-small sm-bot-status">
                <span className="sm-bot-live" aria-hidden="true" />
                {t("status", { church: church.shortName })}
              </p>
            </div>

            <div className="sm-bot-tools">
              <button
                type="button"
                className="sm-bot-icon"
                onClick={reset}
                title={t("reset")}
                aria-label={t("reset")}
              >
                <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="sm-bot-icon"
                onClick={() => closePanel()}
                title={t("closeWindow")}
                aria-label={t("closeWindow")}
              >
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            ref={logRef}
            className="sm-bot-log"
            data-lenis-prevent
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <article
                  key={msg.id}
                  className={`sm-bot-turn ${isUser ? "sm-bot-turn-me" : ""}`}
                >
                  <p className="sm-label sm-bot-who">
                    {isUser ? t("roleUser") : t("roleBot")}
                  </p>

                  {isUser ? (
                    <p className="sm-bot-said">{msg.content}</p>
                  ) : msg.content ? (
                    <div
                      className={msg.failed ? "sm-bot-fail" : "sm-bot-say"}
                    >
                      {msg.failed ? (
                        <p>{msg.content}</p>
                      ) : (
                        <ReactMarkdown
                          components={{
                            a: ({ href, children, ...props }) => (
                              <a
                                href={href}
                                target={href?.startsWith("http") ? "_blank" : undefined}
                                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  ) : (
                    <p className="sm-bot-dots" aria-label={t("thinking")}>
                      <span />
                      <span />
                      <span />
                    </p>
                  )}
                </article>
              );
            })}

            {isPristine && (
              <div className="sm-bot-openers">
                <p className="sm-label sm-bot-openers-label">
                  {t("openersLabel")}
                </p>
                {OPENERS.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className="sm-bot-opener"
                    onClick={() => send(t(`openers.${key}.prompt`))}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.75}
                      className="sm-bot-opener-icon"
                      aria-hidden="true"
                    />
                    <span className="sm-bot-opener-label">
                      {t(`openers.${key}.label`)}
                    </span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.75}
                      className="sm-bot-opener-arrow"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            )}

            <div ref={logEndRef} />
          </div>

          <div className="sm-bot-compose">
            <form
              className="sm-bot-field"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={t("placeholder")}
                className="sm-bot-input"
                aria-label={t("placeholder")}
              />
              <button
                type="submit"
                className="sm-bot-send"
                disabled={isLoading || !input.trim()}
                title={t("send")}
                aria-label={t("send")}
              >
                <ArrowUp size={17} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>
            <p className="sm-bot-fine">
              {t("disclaimer", { church: church.shortName })}
            </p>
          </div>
        </section>
      )}

      {showTeaser && !isOpen && (
        <div className="sm-bot-teaser">
          <button
            type="button"
            className="sm-small sm-bot-teaser-text"
            onClick={openPanel}
          >
            {t("teaser")}
          </button>
          <button
            type="button"
            className="sm-bot-teaser-dismiss"
            onClick={() => setShowTeaser(false)}
            title={t("teaserDismiss")}
            aria-label={t("teaserDismiss")}
          >
            <X size={12} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        className="sm-bot-launch"
        onClick={() => (isOpen ? closePanel(false) : openPanel())}
        aria-expanded={isOpen}
        aria-label={isOpen ? t("closeWindow") : t("launch")}
      >
        <span
          className="sm-bot-launch-icon"
          data-state={isOpen ? "hidden" : "shown"}
          aria-hidden="true"
        >
          <MessageCircle size={22} strokeWidth={1.6} />
        </span>
        <span
          className="sm-bot-launch-icon"
          data-state={isOpen ? "shown" : "hidden"}
          aria-hidden="true"
        >
          <X size={22} strokeWidth={1.6} />
        </span>
        {!isOpen && <span className="sm-bot-dot" aria-hidden="true" />}
      </button>
    </div>
  );
}
