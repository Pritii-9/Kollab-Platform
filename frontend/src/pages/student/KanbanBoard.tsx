import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useKanbanStore } from '@/store/kanbanStore'
import { useProjectStore } from '@/store/projectStore'
import type { TaskStatus, TaskPriority } from '@/types/project.types'
import KanbanColumn from '@/components/kanban/KanbanColumn'
import AddTaskModal from '@/components/kanban/AddTaskModal'
import { ArrowLeft, Plus, FolderKanban } from 'lucide-react'

export default function KanbanBoard() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { tasks, columns, addTask } = useKanbanStore()
  const { getProjectById } = useProjectStore()

  const [projectTitle, setProjectTitle] = useState('Project Workspace')
  const [activeModalColumn, setActiveModalColumn] = useState<TaskStatus | null>(null)

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then((proj) => {
        if (proj) {
          setProjectTitle(proj.title)
          document.title = `${proj.title} Kanban — Kollab`
        }
      })
    } else {
      document.title = 'Kanban Board — Kollab'
    }
  }, [projectId])

  const handleAddTask = (taskData: { title: string; description: string; priority: TaskPriority; assignee: string }) => {
    if (!activeModalColumn) return
    addTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: activeModalColumn,
      assigneeName: taskData.assignee,
      projectId: projectId || 'p1',
      labels: ['Task']
    })
  }

  const tasksList = Object.values(tasks).filter(
    (t) => t.projectId === projectId
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/projects')}
            className="p-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FolderKanban size={20} className="text-indigo-400" /> {projectTitle} — Kanban
            </h2>
            <p className="text-xs text-slate-400">Drag & drop tasks across proctored sprint board columns</p>
          </div>
        </div>

        <button
          onClick={() => setActiveModalColumn('Backlog')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasksList.filter((t) => t.status === col.id)
          return (
            <KanbanColumn
              key={col.id}
              column={{ id: col.id, title: col.id, taskIds: col.taskIds }}
              tasks={colTasks}
              onAddTask={(status) => setActiveModalColumn(status)}
            />
          )
        })}
      </div>

      {/* Add Task Modal */}
      {activeModalColumn && (
        <AddTaskModal
          status={activeModalColumn}
          onAdd={handleAddTask}
          onClose={() => setActiveModalColumn(null)}
        />
      )}
    </div>
  )
}
