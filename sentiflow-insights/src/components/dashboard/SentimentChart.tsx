import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SentimentChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const SentimentChart = ({ data }: SentimentChartProps) => {
  const chartData = [
    { name: 'Positive', value: data.positive, color: 'hsl(160, 84%, 39%)' },
    { name: 'Neutral', value: data.neutral, color: 'hsl(38, 92%, 50%)' },
    { name: 'Negative', value: data.negative, color: 'hsl(0, 84%, 60%)' },
  ];

  const total = data.positive + data.neutral + data.negative;

  return (
    <div className="bg-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Overall Sentiment</h3>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentChart;
