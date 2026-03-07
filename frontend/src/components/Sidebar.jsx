import React from 'react'
import {
  LayoutDashboard,
  History,
  Settings,
  Activity,
  ChevronRight,
  Dog,
  Wifi,
} from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History Log', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <aside className="w-64 h-full flex flex-col z-50" style={{ background: 'linear-gradient(180deg, #003c6e 0%, #01579b 60%, #0277bd 100%)' }}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <Dog size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">ASCRD</h1>
          <p className="text-blue-200 text-xs leading-tight">Canine Rabies Screening</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-white/10 flex items-center gap-2">
        <Wifi size={14} className="text-green-300" />
        <span className="text-xs text-blue-100">System Online</span>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-6 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto text-blue-400" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-blue-200 text-xs">
          <Activity size={13} />
          <span>Prototype v1.0 — Medical Grade</span>
        </div>
      </div>
    </aside>
  )
}
