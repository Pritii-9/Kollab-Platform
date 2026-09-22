import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Send, Hash, Paperclip, Smile } from 'lucide-react'

interface Message {
  id: string
  sender: string
  avatar: string
  text: string
  time: string
  isSelf: boolean
}

export default function TeamChat() {
  const { user } = useAuthStore()
  const userName = user?.name || 'Student'
  const userInitial = userName.charAt(0).toUpperCase()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    document.title = 'Team Chat — Kollab'
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal) return
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: userName,
      avatar: userInitial,
      text: inputVal,
      time: 'Just now',
      isSelf: true
    }
    setMessages([...messages, newMsg])
    setInputVal('')
  }

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl border border-[#1e293b] bg-[#0f172a] overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-60 bg-[#080d18] border-r border-[#1e293b] p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Channels</h3>
          <nav className="space-y-1 text-xs">
            {['general', 'kanban-updates', 'proctored-tests', 'placement-discussion'].map((ch, idx) => (
              <button
                key={ch}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                  idx === 0
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hash size={14} /> {ch}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Top Channel Header */}
        <div className="h-14 border-b border-[#1e293b] px-4 flex items-center justify-between bg-[#080d18]/40">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-indigo-400" />
            <span className="font-bold text-white text-sm">general</span>
          </div>
          <span className="text-xs text-slate-400">3 Members Online</span>
        </div>

        {/* Message Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length > 0 ? messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 ${m.isSelf ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {m.avatar}
              </div>
              <div className={`max-w-md space-y-1 ${m.isSelf ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-bold text-white">{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.isSelf
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#080d18] border border-[#1e293b] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              No messages yet. Send a message to start the conversation!
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#1e293b] bg-[#080d18] flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-white">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type a message to your project team..."
            className="flex-1 px-4 py-2 bg-[#0f172a] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
