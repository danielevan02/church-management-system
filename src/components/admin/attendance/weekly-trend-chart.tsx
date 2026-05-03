"use client";

import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Row = {
  sundayDate: string;
  members: number;
  visitors: number;
  total: number;
};

export function WeeklyTrendChart({ data }: { data: Row[] }) {
  const t = useTranslations("attendance.reports.chart");
  const config: ChartConfig = {
    members: { label: t("members"), color: "var(--chart-1)" },
    visitors: { label: t("visitors"), color: "var(--chart-2)" },
  };

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="sundayDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => format(parseISO(v), "dd MMM")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) =>
                format(parseISO(label as string), "EEEE, dd MMM yyyy")
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="members" stackId="a" fill="var(--color-members)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="visitors" stackId="a" fill="var(--color-visitors)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
