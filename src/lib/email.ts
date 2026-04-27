export type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

export type EmailSendResult = {
  id: string;
  provider: string;
};

export interface EmailClient {
  sendMessage(msg: EmailMessage): Promise<EmailSendResult>;
}

class ConsoleStubEmailClient implements EmailClient {
  async sendMessage({
    to,
    subject,
    body,
  }: EmailMessage): Promise<EmailSendResult> {
    const id = `stub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      `\n========== EMAIL STUB ==========\nto:      ${to}\nsubject: ${subject}\nbody:\n${body}\nid:      ${id}\n=================================\n`,
    );
    return { id, provider: "stub" };
  }
}

let client: EmailClient | null = null;

export function email(): EmailClient {
  if (client) return client;
  const provider = process.env.EMAIL_PROVIDER ?? "stub";
  switch (provider) {
    case "stub":
      client = new ConsoleStubEmailClient();
      break;
    case "resend":
      client = new ConsoleStubEmailClient();
      console.warn(
        "[email] Resend adapter not implemented yet — falling back to console stub.",
      );
      break;
    default:
      throw new Error(`Unknown EMAIL_PROVIDER: ${provider}`);
  }
  return client;
}
