import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentsApi } from '@/api/students.api'
import type { Student } from '@/types/student.types'
import SearchInput from '@/components/shared/SearchInput'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import { Download, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'

import { useCacheStore } from '@/store/cacheStore'

export default function StudentList() {
  const navigate = useNavigate()
  const { students, setStudents } = useCacheStore()
  const [loading, setLoading] = useState(students.length === 0)
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [selectedPlacement, setSelectedPlacement] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    document.title = 'Students — Kollab'
    loadStudents()
  }, [selectedYear, selectedBatch, selectedPlacement])

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getRoster({
        search: search || undefined,
        year: selectedYear !== 'all' ? selectedYear : undefined,
        batch: selectedBatch !== 'all' ? selectedBatch : undefined,
        placement_status: selectedPlacement !== 'all' ? selectedPlacement : undefined,
      })
      if (data && data.length > 0) setStudents(data)
    } catch (err) {
      console.error('Failed to load students roster:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !search ||
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
    const matchesBatch =
      selectedBatch === 'all' ||
      !selectedBatch ||
      (student.batch && (
        student.batch.toLowerCase().includes(selectedBatch.toLowerCase()) ||
        selectedBatch.toLowerCase().includes(student.batch.toLowerCase())
      ))
    return matchesSearch && matchesBatch
  })

  const itemsPerPage = 8
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Email', 'Year', 'Batch', 'CGPA', 'Verified Skills', 'Readiness', 'Status']
    const rows = filteredStudents.map((s) => [
      s.rollNumber || 'N/A',
      s.name,
      s.email,
      s.year,
      s.batch,
      s.cgpa,
      s.skills ? s.skills.filter((sk) => sk.status === 'verified').length : 0,
      `${s.trustScore}%`,
      s.placementStatus
    ])
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'kollab_students_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Realtime Students Roster</h2>
          <p className="text-xs text-slate-400">View performance, verified skills, and placement readiness</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredStudents.length === 0}
          className="px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or roll number..." />
        <CustomSelect
          value={selectedYear}
          onChange={(val) => {
            setSelectedYear(val)
            setPage(1)
          }}
          options={[
            { value: 'all', label: 'All Years' },
            { value: '1', label: 'Year 1' },
            { value: '2', label: 'Year 2' },
            { value: '3', label: 'Year 3' },
            { value: '4', label: 'Year 4' }
          ]}
        />
        <CustomSelect
          value={selectedBatch}
          onChange={(val) => {
            setSelectedBatch(val)
            setPage(1)
          }}
          options={[
            { value: 'all', label: 'All Batches' },
            ...Array.from(new Set(students.map((s) => s.batch).filter(Boolean))).map((b) => ({ value: b, label: b }))
          ]}
        />
        <CustomSelect
          value={selectedPlacement}
          onChange={(val) => {
            setSelectedPlacement(val)
            setPage(1)
          }}
          options={[
            { value: 'all', label: 'All Placement Statuses' },
            { value: 'Placed', label: 'Placed' },
            { value: 'Eligible', label: 'Eligible' },
            { value: 'In Process', label: 'In Process' },
            { value: 'Ineligible', label: 'Ineligible' }
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Fetching student roster...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <UserCheck size={32} className="mx-auto mb-2 text-slate-600" />
            No registered students found matching your filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Cohort</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Skills Verified</th>
                <th className="py-3.5 px-4">Readiness %</th>
                <th className="py-3.5 px-4">Placement Badge</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-[#152035] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border border-indigo-400/30">
                        {student.name ? student.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{student.name}</p>
                        <span className="text-[10px] text-slate-400">{student.department}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{student.rollNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-300">
                    Yr {student.year ?? '—'} · {student.batch ?? '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{student.cgpa ?? '—'}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-bold text-indigo-400">
                      {student.skills ? student.skills.filter((s) => s.status === 'verified').length : 0}
                    </span>{' '}
                    verified
                  </td>
                  <td className="py-3 px-4 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${student.trustScore ?? 0}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-200">{student.trustScore ?? '—'}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <PlacementStatusBadge status={student.placementStatus ?? 'Ineligible'} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/coordinator/students/${student.id}`)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20"
                    >
                      View Timeline →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredStudents.length)} of{' '}
            {filteredStudents.length} students
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-[#0f172a] border border-[#1e293b] disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-[#0f172a] border border-[#1e293b] disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
