import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { History, Trash2, RefreshCw, ShieldAlert, ShieldCheck, Loader2, ChevronLeft, Zap, Activity, Calendar } from 'lucide-react'

export default function HistoryLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('https://web-dog-detech.onrender.com/history')
      console.log(data)
      setEntries(data.entries)
    } catch {
      setError('Could not load history. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Clear selection on refresh
  const handleRefresh = () => {
    setSelectedEntry(null)
    fetchHistory()
  }

  const clearHistory = async () => {
    if (!window.confirm('Clear all history entries?')) return
    setClearing(true)
    try {
      await axios.delete('/api/history')
      setEntries([])
    } catch {
      setError('Failed to clear history.')
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <History size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">History Log</h2>
            <p className="text-slate-400 text-sm">{entries.length} screening record{entries.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedEntry ? (
            <button
              onClick={() => setSelectedEntry(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} /> Back to List
            </button>
          ) : (
            <>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={clearHistory}
                disabled={clearing || entries.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                <Trash2 size={14} /> {clearing ? 'Clearing…' : 'Clear'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 size={20} className="animate-spin" />
            Loading history…
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 text-sm">{error}</div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <History size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No screening records yet</p>
            <p className="text-slate-300 text-xs mt-1">Analyze an audio file to populate history</p>
          </div>
        ) : selectedEntry ? (
          <div className="p-8">
            <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row items-center md:items-start gap-8 ${
              selectedEntry.risk_level === 'risk' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
            }`}>
              {/* Giant Icon */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                selectedEntry.risk_level === 'risk' ? 'bg-red-100 text-red-600 border-4 border-red-200' : 'bg-green-100 text-green-600 border-4 border-green-200'
              }`}>
                {selectedEntry.risk_level === 'risk' ? <ShieldAlert size={48} /> : <ShieldCheck size={48} />}
              </div>
              
              {/* Content */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-2xl font-bold ${selectedEntry.risk_level === 'risk' ? 'text-red-700' : 'text-green-700'}`}>
                    {selectedEntry.risk_level === 'risk' ? 'Risk Detected' : 'Normal Bark Pattern'}
                  </h3>
                  <span className="text-sm font-mono text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-slate-200/50">
                    Record #{selectedEntry.id}
                  </span>
                </div>
                <p className="text-slate-600 mb-6 flex items-center gap-2">
                  <Calendar size={14} className="opacity-50" />
                  Analyzed on {selectedEntry.date}
                </p>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-white shadow-sm flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1"><Zap size={14}/> Prediction</span>
                    <span className="text-lg font-bold text-slate-800">{selectedEntry.prediction}</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-white shadow-sm flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1"><Activity size={14} /> Peak Freq.</span>
                    <span className="text-lg font-bold text-slate-800">{selectedEntry.peak_frequency.toFixed(1)} Hz</span>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-white shadow-sm flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Confidence</span>
                    <span className={`text-lg font-bold ${selectedEntry.risk_level === 'risk' ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.round(selectedEntry.confidence * 100)}%
                    </span>
                    <div className="w-full bg-slate-200/50 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-full rounded-full ${selectedEntry.risk_level === 'risk' ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.round(selectedEntry.confidence * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100" style={{ background: '#f8fafc' }}>
                  {['ID', 'Date & Time', 'Prediction', 'Confidence', 'Peak Freq (Hz)', 'Risk Level'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEntry(e)}
                    className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs hover:text-blue-500">#{e.id}</td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{e.date}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{e.prediction}</td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${e.risk_level === 'risk' ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{e.peak_frequency.toFixed(1)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        e.risk_level === 'risk'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {e.risk_level === 'risk'
                          ? <><ShieldAlert size={11} /> Risk</>
                          : <><ShieldCheck size={11} /> Normal</>
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
