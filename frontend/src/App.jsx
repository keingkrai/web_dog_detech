import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import AudioInput from './components/AudioInput'
import ResultsDashboard from './components/ResultsDashboard'
import HistoryLog from './components/HistoryLog'
import SettingsView from './components/SettingsView'
import { Activity, CheckCircle2, Stethoscope, Menu, X } from 'lucide-react'

function DashboardView({ result, setResult }) {
  return (
    <div className="space-y-4 md:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analysis Center</h2>
          <p className="text-slate-400 text-xs mt-0.5">Upload or record a dog bark for acoustic screening</p>
        </div>
        {result && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100">
            <CheckCircle2 size={15} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">Analysis Complete</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* Left Column: Input Panel + Info Strip */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Stethoscope size={16} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Audio Input</h3>
            </div>
            <AudioInput onResult={(r) => setResult(r)} />
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Activity size={16} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-700">Diagnostic Results</h3>
          </div>
          {result ? (
            <ResultsDashboard result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 md:h-48 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <Activity size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No results yet</p>
              <p className="text-slate-300 text-sm mt-1">Analyze an audio file to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [result, setResult] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative" style={{ background: '#f0f4f8' }}>
      
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between bg-[#01579b] text-white p-4 shadow-md z-20">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-blue-300" />
          <span className="font-bold tracking-wide">ASCRD</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-30" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar activeView={activeView} setActiveView={(v) => { setActiveView(v); setMobileMenuOpen(false); }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-5 h-[calc(100vh-60px)] md:h-screen overflow-auto flex flex-col w-full">
        {/* Top Bar */}
        <div className="mb-4 flex items-center justify-between shrink-0 hidden md:flex">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            ASCRD — Acoustic Screening for Canine Rabies Detection
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">System Ready</span>
          </div>
        </div>

        {activeView === 'dashboard' && <DashboardView result={result} setResult={setResult} />}
        {activeView === 'history' && <HistoryLog />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
