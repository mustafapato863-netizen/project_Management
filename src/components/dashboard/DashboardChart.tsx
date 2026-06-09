import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DashboardChartProps {
  title: string;
  data: Record<string, number>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const formatLabel = (name: string) => {
  if (name === "OnHold") return "On Hold";
  return name;
};

const DashboardChart = ({ title, data }: DashboardChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    key: name,
    name: formatLabel(name),
    value,
  }));

  const colorMap = new Map(
    chartData.map((item, index) => [
      item.key,
      COLORS[index % COLORS.length],
    ]),
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const visibleData = chartData.filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={visibleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={0}
                  dataKey="value"
                  nameKey="name"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {visibleData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={colorMap.get(item.key)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number | string | undefined, name: string | number | undefined) => [value ?? "", name ?? ""]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4">
              {chartData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colorMap.get(item.key) }}
                  />
                  <span>
                    {item.name}:{" "}
                    <span className="font-medium text-gray-900">
                      {item.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
