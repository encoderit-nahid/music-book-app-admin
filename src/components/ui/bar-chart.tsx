import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  month: string;
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

export function ChartBarMultiple({ data }: { data: ChartRow[] }) {
  // 1. Define all months you want to display
  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 2. Merge your data with the full year template
  const formattedData = allMonths.map((monthName) => {
    // Look for existing data for this month
    const existingData = data.find(
      (d) => d.month.toLowerCase() === monthName.toLowerCase()
    );

    // If found, use it; otherwise, return a "zeroed out" object for that month
    return existingData || {
      month: monthName,
      pending: 0,
      assigned: 0,
      live: 0,
      completed: 0,
      incomplete: 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Service Overview</CardTitle>
        <CardDescription>Full Year Progress</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>

          <BarChart accessibilityLayer data={formattedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)} // Shows Jan, Feb, etc.
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
            <Bar dataKey="assigned" fill="var(--color-assigned)" radius={4} />
            <Bar dataKey="live" fill="var(--color-live)" radius={4} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            <Bar dataKey="incomplete" fill="var(--color-incomplete)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
