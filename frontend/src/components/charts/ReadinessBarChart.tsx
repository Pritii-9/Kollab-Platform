import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'

interface ReadinessBarChartProps {
  data: Array<{
    name: string
    value: number
  }>
  height?: number
}

const getBarColor = (value: number) => {
  if (value < 40) return '#f43f5e' // rose
  if (value < 70) return '#f59e0b' // amber
  return '#10b981' // emerald
}

export function ReadinessBarChart({ data, height = 240 }: ReadinessBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(val) => [`${val ?? 0}%`, 'Readiness'] as [string, string]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
export default ReadinessBarChart
