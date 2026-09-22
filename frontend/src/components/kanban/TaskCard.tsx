import React from 'react'
import type { Task } from '@/types/project.types'
import { GripVertical, Calendar } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onDelete?: (id: string) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  }

  const assignee = task.assigneeName || task.assigneeId

  return (
    <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/50 transition-all shadow-md space-y-2 group cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
        <GripVertical size={16} className="text-slate-500 group-hover:text-slate-300" />
      </div>

      <h4 className="font-bold text-slate-100 text-xs leading-snug">{task.title}</h4>

      {task.description && <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>}

      <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[9px]">
            {assignee?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="truncate max-w-[80px]">{assignee || 'Unassigned'}</span>
        </div>

        {task.dueDate && (
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar size={12} /> {task.dueDate}
          </span>
        )}
      </div>
    </div>
  )
}
export default TaskCard
