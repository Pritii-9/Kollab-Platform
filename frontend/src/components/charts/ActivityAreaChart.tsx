import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

interface ActivityAreaChartProps {
  data: Array<{
    date: string
    tests: number
    projects: number
    profiles: number
  }>
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] p-3 rounded-xl shadow-xl text-xs">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 my-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function ActivityAreaChart({ data, height = 300 }: ActivityAreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="testsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="projectsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profilesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
          <YAxis stroke="#475569" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="tests" name="Tests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#testsGrad)" />
          <Area type="monotone" dataKey="projects" name="Projects" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#projectsGrad)" />
          <Area type="monotone" dataKey="profiles" name="Profiles" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#profilesGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
export default ActivityAreaChart
