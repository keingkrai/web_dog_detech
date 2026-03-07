import React, { useMemo } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { ShieldCheck, ShieldAlert, Zap, Clock, Activity, BarChart3, Waves } from 'lucide-react'

function RiskGauge({ riskLevel, confidence }) {
  const isRisk = riskLevel === 'risk'
  return (
    <div className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all ${
      isRisk ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
    }`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
        isRisk ? 'bg-red-100 animate-risk' : 'bg-green-100 animate-normal'
      }`}>
        {isRisk
          ? <ShieldAlert size={28} className="text-red-600" />
          : <ShieldCheck size={28} className="text-green-600" />
        }
      </div>
      <p className={`text-xl font-bold ${isRisk ? 'text-red-700' : 'text-green-700'}`}>
        {isRisk ? 'Risk Detected' : 'Normal'}
      </p>
      <p className="text-slate-500 text-sm mt-1">Acoustic Assessment</p>
      <div className="mt-4 w-36 bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isRisk ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${Math.round(confidence * 100)}%` }}
        />
      </div>
      <p className={`mt-2 text-lg font-bold ${isRisk ? 'text-red-600' : 'text-green-600'}`}>
        {Math.round(confidence * 100)}% Confidence
      </p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const clr = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    violet: 'bg-violet-50 text-violet-600',
  }[color]
  return (
    <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm card-hover flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${clr}`}>
          <Icon size={16} />
        </div>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function ResultsDashboard({ result }) {
  const { prediction, confidence, risk_level, peak_frequency,
    waveform_data, frequency_data, processing_time_ms, mfcc_features } = result

  const waveformChart = useMemo(() =>
    waveform_data?.map(p => ({ time: p.time, amp: p.amplitude })) || [], [waveform_data])

  const freqChart = useMemo(() =>
    frequency_data?.map(p => ({ freq: p.freq, mag: p.magnitude })) || [], [frequency_data])

  return (
    <div className="space-y-5">
      {/* Risk Gauge + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <RiskGauge riskLevel={risk_level} confidence={confidence} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
          <StatCard icon={Zap} label="Prediction" value={prediction} color="blue" />
          <StatCard icon={Activity} label="Peak Frequency" value={`${peak_frequency.toFixed(1)} Hz`} color="teal" />
          <StatCard icon={Clock} label="Processing" value={`${processing_time_ms}ms`} sub="Pipeline latency" color="violet" />
        </div>
      </div>

      {/* Waveform Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Waves size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">Acoustic Waveform</h3>
          <span className="ml-auto text-[10px] text-slate-400">Time Domain</span>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={waveformChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#01579b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#01579b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v.toFixed(1)}s`} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 11 }}
              formatter={(v) => [v.toFixed(4), 'Amplitude']}
              labelFormatter={(v) => `${parseFloat(v).toFixed(3)}s`}
            />
            <Area type="monotone" dataKey="amp" stroke="#01579b" fill="url(#waveGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Frequency Spectrum Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-teal-600" />
          <h3 className="text-sm font-semibold text-slate-700">Frequency Spectrum</h3>
          <span className="ml-auto text-[10px] text-slate-400">Magnitude vs Hz</span>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={freqChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="freqGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00897b" />
                <stop offset="100%" stopColor="#0277bd" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="freq" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}Hz`} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 1]} />
            <Tooltip
              contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 11 }}
              formatter={(v) => [v.toFixed(4), 'Magnitude']}
              labelFormatter={(v) => `${v} Hz`}
            />
            <ReferenceLine x={peak_frequency} stroke="#c62828" strokeDasharray="5 3"
              label={{ value: `Peak ${peak_frequency.toFixed(0)}Hz`, position: 'top', fontSize: 10, fill: '#c62828' }} />
            <Line type="monotone" dataKey="mag" stroke="#01579b" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
