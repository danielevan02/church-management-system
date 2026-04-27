import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/lib/i18n/navigation";
import type { MemberListItem } from "@/server/queries/members";

const STATUS_VARIANT: Record<
  MemberListItem["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  ACTIVE: "default",
  VISITOR: "secondary",
  INACTIVE: "outline",
  TRANSFERRED: "outline",
  DECEASED: "destructive",
};

export async function MemberTable({ items }: { items: MemberListItem[] }) {
  const t = await getTranslations("members.table");

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{t("colName")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("colContact")}
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              {t("colHousehold")}
            </TableHead>
            <TableHead>{t("colStatus")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("colJoined")}
            </TableHead>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m.id} className="group">
              <TableCell>
                <Link
                  href={`/admin/members/${m.id}`}
                  className="flex items-center gap-3 font-medium hover:underline"
                >
                  <Avatar className="h-9 w-9">
                    {m.photoUrl ? (
                      <AvatarImage src={m.photoUrl} alt={m.fullName} />
                    ) : null}
                    <AvatarFallback>
                      {m.firstName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{m.fullName}</span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {m.phone ?? m.email ?? ""}
                    </span>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                <div className="flex flex-col">
                  {m.phone ? <span>{m.phone}</span> : null}
                  {m.email ? (
                    <span className="text-xs">{m.email}</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {m.household?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {m.joinedAt
                  ? format(new Date(m.joinedAt), "yyyy-MM-dd")
                  : "—"}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/members/${m.id}`}
                  className="text-muted-foreground transition group-hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
