import React from 'react'
import type { Batch } from '@/types/batch.types'
import { FolderKanban } from 'lucide-react'

interface BatchProgressTableProps {
  batches: Batch[]
}

const getReadinessColor = (val: number) => {
  if (val >= 75) return 'bg-emerald-500'
  if (val >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function BatchProgressTable({ batches }: BatchProgressTableProps) {
  if (!batches || batches.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-[#1e293b] bg-[#0f172a] text-center space-y-2">
        <FolderKanban size={32} className="mx-auto text-slate-600" />
        <p className="text-xs text-slate-400">No active batches created yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
            <th className="py-3 px-4">Batch Name</th>
            <th className="py-3 px-4">Students</th>
            <th className="py-3 px-4">Skills Verified</th>
            <th className="py-3 px-4">Readiness %</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {batches.map((batch) => (
            <tr key={batch.id} className="hover:bg-[#152035] transition-colors">
              <td className="py-3 px-4 font-bold text-slate-100">{batch.name}</td>
              <td className="py-3 px-4 text-slate-300">{batch.totalStudents}</td>
              <td className="py-3 px-4 text-slate-300">
                {batch.skillVerified} / {batch.totalStudents}
              </td>
              <td className="py-3 px-4 w-40">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getReadinessColor(
                        batch.readinessPercent
                      )}`}
                      style={{ width: `${batch.readinessPercent}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-200">{batch.readinessPercent}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    batch.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : batch.status === 'Upcoming'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}
                >
                  {batch.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default BatchProgressTable
