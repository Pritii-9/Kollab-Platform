import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { TaskStatus, TaskPriority } from '@/types/project.types'
import { X } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'

interface AddTaskModalProps {
  status: TaskStatus
  onAdd: (task: { title: string; description: string; priority: TaskPriority; assignee: string }) => void
  onClose: () => void
}

export function AddTaskModal({ status, onAdd, onClose }: AddTaskModalProps) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [assignee, setAssignee] = useState(user?.name || 'Student')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    onAdd({ title, description, priority, assignee })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <h3 className="text-base font-bold text-white mb-4">Add Task to {status.toUpperCase()}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement JWT Auth Hook"
              className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <CustomSelect
                value={priority}
                onChange={setPriority}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' }
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default AddTaskModal
