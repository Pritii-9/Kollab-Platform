import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts'

interface SkillRadarChartProps {
  data: Array<{
    subject: string
    current: number
    target: number
  }>
  height?: number
}

export function SkillRadarChart({ data, height = 300 }: SkillRadarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
          <Radar name="Current Level" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
          <Radar name="Target Target" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
export default SkillRadarChart
