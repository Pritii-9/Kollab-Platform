import React from 'react'
import type { Task, TaskStatus } from '@/types/project.types'
import TaskCard from './TaskCard'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  column: {
    id: TaskStatus
    title: string
    taskIds: string[]
  }
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
}

const getColumnColor = (id: TaskStatus) => {
  switch (id) {
    case 'Backlog':
      return 'bg-slate-500'
    case 'In Progress':
      return 'bg-indigo-500'
    case 'In Review':
      return 'bg-amber-500'
    case 'Done':
      return 'bg-emerald-500'
    default:
      return 'bg-slate-500'
  }
}

export function KanbanColumn({ column, tasks, onAddTask }: KanbanColumnProps) {
  return (
    <div className="w-72 shrink-0 flex flex-col rounded-2xl bg-[#080d18] border border-[#1e293b] p-3 max-h-[calc(100vh-200px)]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b] px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${getColumnColor(column.id)}`} />
          <h3 className="font-bold text-slate-100 text-xs">{column.title}</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0f172a] text-slate-400 border border-[#1e293b]">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
          title="Add Task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
export default KanbanColumn
