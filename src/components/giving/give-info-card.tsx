import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/giving/copy-button";
import { QrisImage } from "@/components/giving/qris-image";

type Props = {
  title: string;
  description: string;
  bank: {
    name: string;
    accountNumber: string;
    accountHolder: string;
    qrisImagePath: string;
  };
  labels: {
    qrisLabel: string;
    qrisAlt: string;
    bankAccount: string;
    accountHolder: string;
    accountNumberCopy: string;
    notConfigured: string;
  };
};

export function GiveInfoCard({ title, description, bank, labels }: Props) {
  const hasBank = bank.accountNumber && bank.accountHolder;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              {labels.qrisLabel}
            </div>
            <div className="overflow-hidden rounded-md border bg-white p-3">
              <QrisImage src={bank.qrisImagePath} alt={labels.qrisAlt} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              {labels.bankAccount}
            </div>
            {hasBank ? (
              <div className="flex flex-col gap-2 rounded-md border p-4">
                <div className="text-2xl font-semibold">{bank.name}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-lg tabular-nums">
                    {bank.accountNumber}
                  </span>
                  <CopyButton
                    value={bank.accountNumber}
                    label={labels.accountNumberCopy}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {labels.accountHolder}: {bank.accountHolder}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                {labels.notConfigured}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
