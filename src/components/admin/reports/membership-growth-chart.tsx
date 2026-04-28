"use client";

import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Row = {
  month: string;
  joined: number;
  cumulative: number;
};

export function MembershipGrowthChart({ data }: { data: Row[] }) {
  const t = useTranslations("reports.membership.chart");
  const config: ChartConfig = {
    joined: { label: t("joined"), color: "var(--chart-1)" },
    cumulative: { label: t("cumulative"), color: "var(--chart-2)" },
  };

  return (
    <ChartContainer config={config} className="h-72 w-full">
      <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => format(parseISO(`${v}-01`), "MMM yy")}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) =>
                format(parseISO(`${label}-01`), "MMMM yyyy")
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          yAxisId="left"
          dataKey="joined"
          fill="var(--color-joined)"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          stroke="var(--color-cumulative)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
