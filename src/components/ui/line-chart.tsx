import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
  type ChartConfig,
} from "@/components/ui/chart";

type ChartRow = {
  day: string;
  pending: number;
  assigned: number;
  live: number;
  completed: number;
  incomplete: number;
};

const chartConfig = {
  pending: { label: "Pending", color: "var(--chart-1)" },
  assigned: { label: "Assigned", color: "var(--chart-2)" },
  live: { label: "Live", color: "var(--chart-3)" },
  completed: { label: "Completed", color: "var(--chart-4)" },
  incomplete: { label: "Incomplete", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function ChartLineMultiple({ data }: { data: ChartRow[] }) {
  // 1. Define week order
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    
    
  ];

  // 2. Normalize data: ensure every day exists
  const formattedData = weekDays.map((dayName) => {
    const existingData = data.find(
      (d) => d.day.toLowerCase() === dayName.toLowerCase()
    );

    // Fill zeros if no data for that day
    return (
      existingData || {
        day: dayName,
        pending: 0,
        assigned: 0,
        live: 0,
        completed: 0,
        incomplete: 0,
      }
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Service Trend</CardTitle>
        <CardDescription>Daily activity (Mon - Sun)</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart 
            accessibilityLayer 
            data={formattedData} 
            margin={{ left: 24, right: 12 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)} // Mon, Tue, etc.
              padding={{ left: 20, right: 20 }} 
            />

            <ChartTooltip 
              cursor={true} 
              content={
                <ChartTooltipContent indicator="line" />
              } 
            />

            <Line 
              dataKey="pending" 
              type="monotone" 
              stroke="var(--color-pending)" 
              strokeWidth={2} 
              activeDot={{ r: 6 }}
            />
            <Line 
              dataKey="assigned" 
              type="monotone" 
              stroke="var(--color-assigned)" 
              strokeWidth={2} 
              activeDot={{ r: 6 }}
            />
            <Line 
              dataKey="live" 
              type="monotone" 
              stroke="var(--color-live)" 
              strokeWidth={2} 
             activeDot={{ r: 6 }}
            />
            <Line 
              dataKey="completed" 
              type="monotone" 
              stroke="var(--color-completed)" 
              strokeWidth={2} 
              activeDot={{ r: 6 }}
            />
            <Line 
              dataKey="incomplete" 
              type="monotone" 
              stroke="var(--color-incomplete)" 
              strokeWidth={2} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
