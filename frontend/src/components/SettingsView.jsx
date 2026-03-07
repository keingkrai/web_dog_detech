import React from 'react'
import { Settings as SettingsIcon, ShieldOff, Server, Cpu, Info } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  )
}

export default function SettingsView() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <SettingsIcon size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Settings</h2>
          <p className="text-slate-400 text-sm">System configuration & privacy</p>
        </div>
      </div>

      <Section title="Privacy Controls">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <ShieldOff size={22} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Data Privacy: PROTECTED</p>
            <p className="text-blue-700 text-xs mt-1">
              All audio processing is performed locally and in-memory only. No data is saved to disk or transmitted externally.
            </p>
          </div>
        </div>
        <InfoRow label="Audio Storage" value="In-memory only (session)" />
        <InfoRow label="Data Retention" value="None — cleared on server restart" />
        <InfoRow label="External Requests" value="None" />
      </Section>

      <Section title="Processing Configuration">
        <InfoRow label="Sample Rate" value="22,050 Hz" />
        <InfoRow label="MFCC Coefficients" value="40" />
        <InfoRow label="Noise Reduction" value="Spectral Gating (noisereduce)" />
        <InfoRow label="FFT Window" value="Default (librosa)" />
        <InfoRow label="Frequency Range" value="0 – 8,000 Hz" />
      </Section>

      <Section title="System Information">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
          <Server size={16} className="text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">Backend: FastAPI running on <code>localhost:8000</code></span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <Cpu size={16} className="text-slate-500" />
          <span className="text-sm text-slate-700 font-medium">Frontend: React + Vite on <code>localhost:5173</code></span>
        </div>
        <InfoRow label="Application" value="ASCRD v1.0.0 Prototype" />
        <InfoRow label="Framework" value="FastAPI + React + Recharts" />
        <InfoRow label="Audio Engine" value="Librosa + Noisereduce" />
      </Section>

      <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50 flex items-start gap-3">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Prototype Notice:</strong> ASCRD is a research prototype. Results are for investigational purposes only and <strong>not for clinical diagnosis</strong>.
          Place the <code>urban_sound_classifier.pkl</code> and <code>label_encoder.pkl</code> files in <code>backend/models_ml/</code> to enable real ML inference.
        </p>
      </div>
    </div>
  )
}
