export type WhatsappMessage = {
  to: string;
  body: string;
};

export type WhatsappSendResult = {
  id: string;
  provider: string;
};

export interface WhatsappClient {
  sendMessage(msg: WhatsappMessage): Promise<WhatsappSendResult>;
}

class ConsoleStubWhatsappClient implements WhatsappClient {
  async sendMessage({ to, body }: WhatsappMessage): Promise<WhatsappSendResult> {
    const id = `stub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      `\n========== WHATSAPP STUB ==========\nto:   ${to}\nbody: ${body}\nid:   ${id}\n===================================\n`,
    );
    return { id, provider: "stub" };
  }
}

let client: WhatsappClient | null = null;

export function whatsapp(): WhatsappClient {
  if (client) return client;
  const provider = process.env.WHATSAPP_PROVIDER ?? "stub";
  switch (provider) {
    case "stub":
      client = new ConsoleStubWhatsappClient();
      break;
    case "fonnte":
      client = new ConsoleStubWhatsappClient();
      console.warn(
        "[whatsapp] Fonnte adapter not implemented yet — falling back to console stub.",
      );
      break;
    default:
      throw new Error(`Unknown WHATSAPP_PROVIDER: ${provider}`);
  }
  return client;
}

const E164_RE = /^\+[1-9]\d{6,14}$/;

export function normalizePhone(input: string): string {
  const trimmed = input.trim().replace(/\s|-/g, "");
  if (E164_RE.test(trimmed)) return trimmed;
  if (trimmed.startsWith("0")) return `+62${trimmed.slice(1)}`;
  if (/^62\d+$/.test(trimmed)) return `+${trimmed}`;
  if (/^8\d+$/.test(trimmed)) return `+62${trimmed}`;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}
