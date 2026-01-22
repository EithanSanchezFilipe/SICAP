"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartBrush,
  type ChartConfig,
} from "@/components/ui/chart";
import { Measurements } from "@/types/sensor";

const chartConfig = {
  value: {
    label: "Valeur",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface SensorChartProps {
  data: Measurements[];
  title: string;
  type: string;
}

export function SensorChart({ data, title, type }: SensorChartProps) {
  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Custom dot for outliers
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    // Ignore Recharts active state, always use our status color
    let color = "var(--color-value)"; // normal
    if (payload.status === "warning") color = "#FACC15"; // yellow
    if (payload.status === "error") color = "#EF4444"; // red

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color} // always the same
        stroke="#00000010"
        strokeWidth={1}
        style={{ cursor: payload.reasons?.length ? "pointer" : "default" }}
        title={payload.reasons?.join(", ")} // tooltip
      />
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Visualisation des données de type {type}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <AreaChart data={data} margin={{ left: -20, right: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4283F0" stopOpacity={1} />
                <stop offset="95%" stopColor="#4283F0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={60}
              tickFormatter={formatDateTime}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={["auto", "auto"]}
            />
            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
              strokeWidth={2}
              animationDuration={1500}
              dot={<CustomDot />}
            />
            <ChartBrush
              dataKey="time"
              height={40}
              stroke="var(--color-value)"
              fill="transparent"
              tickFormatter={formatDateTime}
              className="mt-4"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
