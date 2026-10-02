import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { TaskStatus, TaskPriority } from '@/types/project.types'
import { X, AlertCircle } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [titleError, setTitleError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()

    // Validation: must not be empty or whitespace-only
    if (!trimmedTitle) {
      setTitleError('Task title cannot be empty.')
      return
    }
    if (trimmedTitle.length < 3) {
      setTitleError('Task title must be at least 3 characters.')
      return
    }

    if (isSubmitting) return   // prevent double-click
    setIsSubmitting(true)
    setTitleError('')

    try {
      await onAdd({ title: trimmedTitle, description: description.trim(), priority, assignee: assignee.trim() || user?.name || 'Student' })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>

        <h3 className="text-base font-bold text-white mb-4">Add Task to {status.replace('_', ' ').toUpperCase()}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
              placeholder="e.g. Implement JWT Auth Hook"
              maxLength={120}
              className={`w-full px-3 py-2 rounded-xl bg-[#080d18] border text-xs text-white focus:outline-none transition-colors ${
                titleError ? 'border-rose-500 focus:border-rose-400' : 'border-[#1e293b] focus:border-indigo-500'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-[10px] text-rose-400 flex items-center gap-1">
                <AlertCircle size={10} /> {titleError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              maxLength={500}
              className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white resize-none focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
              ) : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default AddTaskModal

