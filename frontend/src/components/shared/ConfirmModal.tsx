import React from 'react'
import { X } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  isDanger?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isDanger = false,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b]"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{description}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-[#1e293b] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
            }`}
          >
            {isLoading && <LoadingSpinner size="sm" color="#ffffff" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmModal
