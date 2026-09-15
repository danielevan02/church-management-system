import { google } from "@ai-sdk/google";
import { stepCountIs, streamText } from "ai";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { routing } from "@/lib/i18n/routing";
import { features } from "@/config/features";
import { getChurchSystemPrompt } from "@/lib/ai/church-assistant-prompt";
import { checkRateLimit, clientIp } from "@/lib/ai/rate-limit";
import { buildAssistantTools } from "@/lib/ai/tools";

export const maxDuration = 30;

/**
 * Hard caps on what an anonymous caller can put in front of a paid model.
 *
 * Unlike the rate limiter these do not depend on shared state, so they hold on
 * every instance: a single request can never carry more than ~24k characters
 * of history, and `role` is narrowed to the two the widget actually sends —
 * without that, a caller could post a `system` turn and rewrite the
 * assistant's instructions from the browser.
 */
const MAX_MESSAGE_CHARS = 2_000;
const MAX_MESSAGES = 24;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(MAX_MESSAGES),
  locale: z.enum(routing.locales).optional(),
});

function fail(error: string, status: number, headers?: HeadersInit) {
  return Response.json({ error }, { status, headers });
}

export async function POST(req: Request) {
  if (!features.aiAssistant) return fail("FEATURE_DISABLED", 404);

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[churchAssistant] missing GOOGLE_GENERATIVE_AI_API_KEY");
    return fail("ASSISTANT_UNCONFIGURED", 503);
  }

  const limit = checkRateLimit(clientIp(req));
  if (!limit.ok) {
    return fail("RATE_LIMITED", 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return fail("INVALID_REQUEST", 400);
  }

  try {
    const locale = body.locale ?? routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: "lp" });

    const result = streamText({
      model: google("gemini-3.6-flash"),
      system: await getChurchSystemPrompt(locale),
      messages: body.messages,
      temperature: 0.7,
      // A visitor's question needs at most one lookup and an answer. The stop
      // condition is what keeps a confused model from looping tool calls on
      // someone else's budget.
      stopWhen: stepCountIs(3),
      tools: buildAssistantTools(t),
      maxOutputTokens: 1_200,
      // Errors raised after the stream has begun (quota, safety, upstream
      // drops) never reach the catch below — the response has already been
      // handed back with a 200. Without this they are silent on both ends.
      onError: ({ error }) => {
        console.error("[churchAssistant] stream", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[churchAssistant]", error);
    return fail("INTERNAL_ERROR", 500);
  }
}
