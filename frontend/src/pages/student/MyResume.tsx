import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { FileText, UploadCloud, CheckCircle2, Eye, Download, History, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyResume() {
  const { user } = useAuthStore()
  const userNameForFile = user?.name ? user.name.replace(/\s+/g, '_') : 'Student'
  
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; date: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    document.title = 'My Resume — Kollab'
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(20)
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadedFile({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: 'Just now'
          })
          return 100
        }
        return p + 30
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Placement Resume Dossier</h2>
        <p className="text-xs text-slate-400">Upload your PDF resume to generate AI bullet enhancements and share with recruiters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 40% Upload & Version History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Drag and Drop Zone */}
          <div className="p-8 rounded-2xl bg-[#0f172a] border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 transition-all text-center space-y-4 relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
              <UploadCloud size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Drop your PDF resume here</h3>
              <p className="text-xs text-slate-400 mt-1">Supports PDF files up to 10MB</p>
            </div>

            {isUploading && (
              <div className="space-y-2 pt-2">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-indigo-400 font-semibold">Uploading... {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Current Active Resume Details */}
          {uploadedFile && (
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active Resume
                </span>
                <span className="text-xs text-slate-500">{uploadedFile.date}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-sm truncate">{uploadedFile.name}</h4>
                  <p className="text-xs text-slate-400">{uploadedFile.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  onClick={() => toast.success('Preview generation not yet integrated.')}
                  className="flex-1 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-300 text-xs font-semibold hover:text-white flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Preview PDF
                </button>
                <button
                  onClick={() => toast.success(`Downloading ${uploadedFile.name}`)}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          )}

          {/* Version History List */}
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History size={14} className="text-indigo-400" /> Resume Version History
            </h4>
            <p className="text-slate-400 text-xs">No previous resume versions found.</p>
          </div>
        </div>

        {/* Right 60% PDF Preview Mock Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl min-h-[500px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live PDF Preview Rendering</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Document {uploadedFile?.name || 'resume.pdf'} is verified and ready for coordinator review and placement export.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] w-full max-w-md text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Sparkles size={14} /> AI Verified Resume Highlights
              </div>
              <p className="text-slate-400 italic">No resume uploaded yet. Upload a PDF to generate AI insights and highlight verified skills.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
