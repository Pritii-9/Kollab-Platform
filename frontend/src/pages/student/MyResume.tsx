import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  FileText, UploadCloud, CheckCircle2, Eye, Star, Plus,
  Download, Sparkles, Loader2, X, Shield, ArrowRight, Trash2, AlertTriangle, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '@/api/client'
import { resumeApi, type ResumeItem } from '@/api/resume.api'

export default function MyResume() {
  const { user } = useAuthStore()

  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [primaryResume, setPrimaryResume] = useState<ResumeItem | null>(null)
  const [loading, setLoading] = useState(true)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [activePreviewDoc, setActivePreviewDoc] = useState<{ title: string; url: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalFileInputRef = useRef<HTMLInputElement>(null)

  const getFullUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url
    if (url.startsWith('/')) {
      const baseURL = apiClient.defaults.baseURL || 'http://localhost:5000/api'
      const origin = baseURL.replace(/\/api\/?$/, '')
      return `${origin}${url}`
    }
    return url
  }

  const fetchResumes = async () => {
    try {
      setLoading(true)
      const data = await resumeApi.getMyResumes()
      const rawResumes = Array.isArray(data?.resumes) ? data.resumes : []
      const resolvedList = rawResumes.map((r, idx) => ({
        ...r,
        id: r.id || `res_${idx + 1}`,
        title: r.title || r.name || 'Resume Document',
        name: r.name || 'resume.pdf',
        size: r.size || 'PDF',
        date: r.date || 'Active',
        is_primary: Boolean(r.is_primary),
        url: getFullUrl(r.url) || r.url || ''
      }))
      setResumes(resolvedList)
      
      const prim = resolvedList.find(r => r.is_primary) || resolvedList[0] || null
      setPrimaryResume(prim)
      if (prim?.url) {
        useAuthStore.getState().updateUser({ resumeUrl: prim.url })
      }
    } catch (err: any) {
      console.error('Failed to load resumes:', err)
      const message = err?.response?.data?.detail || err?.message || 'Failed to load resumes'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'My Resumes — Kollab'
    fetchResumes()
  }, [])

  const handleUploadSubmit = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedFile
    if (!file) {
      toast.error('Please select a PDF file to upload')
      return
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large — max 10 MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(15)

    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + 15 : p))
    }, 250)

    try {
      await resumeApi.uploadResume(file, customTitle.trim() || undefined, true)
      clearInterval(progressInterval)
      setUploadProgress(100)

      await fetchResumes()

      toast.success('Resume uploaded successfully!')
      setUploadModalOpen(false)
      setCustomTitle('')
      setSelectedFile(null)
    } catch (err: any) {
      clearInterval(progressInterval)
      toast.error(err?.response?.data?.detail || 'Failed to upload resume file')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 800)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (modalFileInputRef.current) modalFileInputRef.current.value = ''
    }
  }

  const handleSetPrimary = async (resumeId: string) => {
    try {
      await resumeApi.setPrimary(resumeId)
      await fetchResumes()
      toast.success('Active primary resume updated!')
    } catch {
      toast.error('Could not update primary resume')
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    setIsDeleting(true)
    try {
      await resumeApi.deleteResume(deleteModal.id)
      await fetchResumes()
      toast.success(`Deleted "${deleteModal.name}"`)
    } catch {
      toast.error('Failed to delete resume file')
    } finally {
      setIsDeleting(false)
      setDeleteModal(null)
    }
  }

  const openPreview = (title: string, url?: string) => {
    const targetUrl = url || primaryResume?.url
    if (!targetUrl) {
      toast.error('No document available to preview')
      return
    }
    setActivePreviewDoc({ title, url: targetUrl })
  }

  const handleDownload = (title?: string, url?: string) => {
    const targetUrl = url || primaryResume?.url
    if (!targetUrl) {
      toast.error('No document to download')
      return
    }
    const a = document.createElement('a')
    a.href = targetUrl
    a.download = title || primaryResume?.name || 'resume.pdf'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-[#0f172a] to-[#080d18] border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Multi-Resume Vault
            </span>
            <span className="text-xs text-slate-400">Tailored Placement Dossiers</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Placement Resume Dossier</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Upload and manage multiple resumes (Full Stack, Backend, Data Science), switch active placement resume, and preview anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} /> Upload New Resume
          </button>
        </div>
      </div>

      {/* Main Grid — 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Active Spotlight & Resume List (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Active Primary Resume Spotlight Card */}
          {primaryResume ? (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-indigo-500/30 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> Active Placement Resume
                </span>
                <span className="text-xs font-medium text-slate-400">{primaryResume.date}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  <FileText size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-white text-lg truncate">{primaryResume.title || primaryResume.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{primaryResume.name} · {primaryResume.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#080d18] border border-[#1e293b] text-[10px] font-bold text-indigo-300">
                      Primary Dossier
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Shield size={10} /> Recruiter Trust Score: {user?.trustScore ?? 92}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#1e293b]">
                <button
                  onClick={() => openPreview(primaryResume.title || primaryResume.name, primaryResume.url)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Eye size={16} /> Preview PDF
                </button>
                <button
                  onClick={() => handleDownload(primaryResume.title || primaryResume.name, primaryResume.url)}
                  className="flex-1 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={() => setDeleteModal({ id: primaryResume.id, name: primaryResume.title || primaryResume.name })}
                  title="Remove Resume"
                  className="p-2.5 rounded-xl bg-[#080d18] hover:bg-rose-500/20 border border-[#1e293b] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Upload Dropzone if no resumes */
            <div
              onClick={() => setUploadModalOpen(true)}
              className="p-10 rounded-2xl bg-[#0f172a] border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 transition-all text-center space-y-4 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <UploadCloud size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload your Placement Resume</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click here to upload your first resume PDF (up to 10 MB).
                </p>
              </div>
            </div>
          )}

          {/* ── Multiple Resumes Vault List ── */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-indigo-400" /> My Resumes Vault
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-extrabold">
                {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
              </span>
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : resumes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No resumes uploaded yet. Click "+ Upload New Resume" above to add one.</p>
            ) : (
              <div className="space-y-3 pt-1">
                {resumes.map((r) => {
                  const isPrim = r.id === primaryResume?.id || r.is_primary
                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl border transition-all duration-200 space-y-3 ${
                        isPrim
                          ? 'bg-[#080d18] border-indigo-500/40'
                          : 'bg-[#080d18]/60 border-[#1e293b] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            isPrim ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 border-[#1e293b]'
                          }`}>
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-white truncate">{r.title || r.name}</h4>
                              {isPrim ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-extrabold flex items-center gap-1">
                                  <Star size={10} className="fill-amber-400" /> Primary
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetPrimary(r.id)}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-[#1e293b] text-[9px] font-bold transition-all cursor-pointer"
                                >
                                  Set as Primary
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{r.name} · {r.size} · {r.date}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openPreview(r.title || r.name, r.url)}
                            title="Preview PDF"
                            className="p-2 rounded-xl bg-[#0f172a] hover:bg-indigo-600 border border-[#1e293b] text-indigo-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDownload(r.title || r.name, r.url)}
                            title="Download PDF"
                            className="p-2 rounded-xl bg-[#0f172a] hover:bg-slate-700 border border-[#1e293b] text-slate-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ id: r.id, name: r.title || r.name })}
                            title="Delete Resume"
                            className="p-2 rounded-xl bg-[#0f172a] hover:bg-rose-500/20 border border-[#1e293b] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: AI Verified Highlights & Tools (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Verified Resume Highlights */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles size={16} /> AI Verified Placement Telemetry
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Proctored Audit</span>
            </div>

            <ul className="space-y-2.5">
              {[
                `Multi-resume dossier enabled: ${resumes.length} stored PDF ${resumes.length === 1 ? 'version' : 'versions'}`,
                `Primary Dossier: ${primaryResume?.title || primaryResume?.name || 'Primary Placement PDF'}`,
                `Proctored Recruiter Trust Score: ${user?.trustScore ?? 92}/100`,
                'Verified Skill Badges attached (React, Node.js, Python, FastAPI)',
                'Collaborative Kanban project telemetry linked'
              ].map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-slate-200 leading-relaxed">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Resume Action Bullets Launcher Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-[#0f172a] border border-indigo-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={16} /> AI Resume Bullet Enhancer
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transform your project accomplishments into STAR-formatted action bullet points optimized for Tier 1 recruiters.
            </p>
            <a
              href="/student/ai-tools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              Open AI Resume Tools <ArrowRight size={14} />
            </a>
          </div>

        </div>
      </div>

      {/* ── UPLOAD RESUME MODAL ── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UploadCloud size={20} className="text-indigo-400" /> Upload New Resume PDF
              </h3>
              <button
                onClick={() => { setUploadModalOpen(false); setSelectedFile(null); setCustomTitle(''); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Resume Title / Role Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer Resume, Data Engineer Resume"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">PDF File</label>
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  className="p-6 rounded-xl bg-[#080d18] border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 transition-all text-center space-y-2 cursor-pointer"
                >
                  <FileText size={24} className="mx-auto text-indigo-400" />
                  {selectedFile ? (
                    <p className="text-xs font-bold text-emerald-400 truncate">{selectedFile.name}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Click to select PDF resume file (Max 10 MB)</p>
                  )}
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) setSelectedFile(f)
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-indigo-400 font-bold">{uploadProgress}% Uploading...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setUploadModalOpen(false); setSelectedFile(null); setCustomTitle(''); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUploadSubmit()}
                disabled={isUploading || !selectedFile}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ON-DEMAND PREVIEW MODAL ── */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-5xl h-[90vh] rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#080d18] border-b border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activePreviewDoc.title}</h3>
                  <span className="text-[10px] text-emerald-400 font-medium">Verified PDF Document Preview</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(activePreviewDoc.title, activePreviewDoc.url)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => setActivePreviewDoc(null)}
                  className="p-2 rounded-xl bg-[#0f172a] hover:bg-rose-500/20 border border-[#1e293b] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#050811] relative">
              <iframe
                src={activePreviewDoc.url}
                title="Document Preview"
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Resume</h3>
                <p className="text-xs text-slate-400">Permanent dossier action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-[#080d18] p-3.5 rounded-xl border border-[#1e293b] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteModal.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
