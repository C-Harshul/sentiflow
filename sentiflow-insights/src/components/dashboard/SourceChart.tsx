import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SourceChartProps {
  data: Array<{
    source: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
}

const SourceChart = ({ data }: SourceChartProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Feedback by Source</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="source"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
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
            <Bar dataKey="positive" fill="hsl(160, 84%, 39%)" name="Positive" radius={[4, 4, 0, 0]} />
            <Bar dataKey="neutral" fill="hsl(38, 92%, 50%)" name="Neutral" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" fill="hsl(0, 84%, 60%)" name="Negative" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SourceChart;
