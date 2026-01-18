import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  data: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

const TrendChart = ({ data }: TrendChartProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">30-Day Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval={4}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2}
              dot={false}
              name="Positive"
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              dot={false}
              name="Neutral"
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              dot={false}
              name="Negative"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
