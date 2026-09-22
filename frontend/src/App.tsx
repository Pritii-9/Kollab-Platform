import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Toaster } from 'react-hot-toast'

// Layout
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

// Standalone pages (no layout)
import Login from '@/pages/Login'

// Coordinator pages
import CoordinatorDashboard from '@/pages/coordinator/CoordinatorDashboard'
import BatchManagement from '@/pages/coordinator/BatchManagement'
import StudentList from '@/pages/coordinator/StudentList'
import StudentTimeline from '@/pages/coordinator/StudentTimeline'
import AssignTest from '@/pages/coordinator/AssignTest'
import Reports from '@/pages/coordinator/Reports'
import Announcements from '@/pages/coordinator/Announcements'

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import MyProfile from '@/pages/student/MyProfile'
import MyResume from '@/pages/student/MyResume'
import FindTeammates from '@/pages/student/FindTeammates'
import MyProjects from '@/pages/student/MyProjects'
import ProjectDetail from '@/pages/student/ProjectDetail'
import KanbanBoard from '@/pages/student/KanbanBoard'
import Milestones from '@/pages/student/Milestones'
import Analytics from '@/pages/student/Analytics'
import TeamChat from '@/pages/student/TeamChat'
import Notifications from '@/pages/student/Notifications'
import AITools from '@/pages/student/AITools'
import Settings from '@/pages/student/Settings'
import TakeTest from '@/pages/student/TakeTest'
import TestResult from '@/pages/student/TestResult'

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard'} replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Standalone — no sidebar/header */}
          <Route path="/login" element={<Login />} />
          <Route path="/student/test/:testId" element={<TakeTest />} />
          <Route path="/student/test/:testId/result" element={<TestResult />} />

          {/* Coordinator routes */}
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute role="coordinator">
                <Layout role="coordinator" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<CoordinatorDashboard />} />
            <Route path="batches"       element={<BatchManagement />} />
            <Route path="students"      element={<StudentList />} />
            <Route path="students/:id"  element={<StudentTimeline />} />
            <Route path="assign-test"   element={<AssignTest />} />
            <Route path="reports"       element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <Layout role="student" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"          element={<StudentDashboard />} />
            <Route path="profile"            element={<MyProfile />} />
            <Route path="resume"             element={<MyResume />} />
            <Route path="teammates"          element={<FindTeammates />} />
            <Route path="projects"           element={<MyProjects />} />
            <Route path="projects/:id"       element={<ProjectDetail />} />
            <Route path="kanban/:projectId"  element={<KanbanBoard />} />
            <Route path="milestones"         element={<Milestones />} />
            <Route path="analytics"          element={<Analytics />} />
            <Route path="chat"               element={<TeamChat />} />
            <Route path="notifications"      element={<Notifications />} />
            <Route path="ai-tools"           element={<AITools />} />
            <Route path="settings"           element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
