import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { PointsChartPoint } from '../utils/chart-data'

interface PointsChartProps {
  data: PointsChartPoint[]
}

export function PointsChart({ data }: PointsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sem dados para exibir.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="round"
            stroke="var(--color-muted-foreground)"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            label={{
              value: 'Rodadas',
              position: 'insideBottom',
              offset: -4,
              fill: 'var(--color-muted-foreground)',
              fontSize: 12
            }}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            label={{
              value: 'Pontos',
              angle: -90,
              position: 'insideLeft',
              fill: 'var(--color-muted-foreground)',
              fontSize: 12
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              color: 'var(--color-foreground)'
            }}
            labelStyle={{ color: 'var(--color-muted-foreground)' }}
            formatter={(value: number) => [value, 'Pontos']}
            labelFormatter={(label: number) => `Rodada ${label}`}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--color-primary)', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
