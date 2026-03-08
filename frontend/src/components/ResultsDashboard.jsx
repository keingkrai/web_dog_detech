import React from 'react'
import { ShieldCheck, ShieldAlert, Zap, Clock, Activity, AlertTriangle, PhoneCall, Home, Info } from 'lucide-react'

function PreventionGuidelines() {
  return (
    <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm p-4 mt-5">
      <div className="flex items-center gap-2 mb-3 text-red-700">
        <AlertTriangle size={20} />
        <h3 className="font-bold text-lg">แนวทางป้องกันและการจัดการเมื่อพบความเสี่ยง</h3>
      </div>
      
      <div className="space-y-3 text-sm text-red-800">
        <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-red-50">
          <Home className="shrink-0 mt-0.5 text-red-600" size={18} />
          <div>
            <p className="font-semibold text-red-900 mb-0.5">1. กักบริเวณสัตว์ทันที (Isolation)</p>
            <p className="leading-relaxed">แยกสุนัขออกจากคนและสัตว์เลี้ยงอื่นๆ นำไปไว้ในกรงที่แข็งแรงและปลอดภัย ห้ามสัมผัสตัวสุนัขโดยตรงโดยไม่สวมอุปกรณ์ป้องกัน</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-red-50">
          <Info className="shrink-0 mt-0.5 text-red-600" size={18} />
          <div>
            <p className="font-semibold text-red-900 mb-0.5">2. สังเกตอาการอย่างใกล้ชิด (Observation)</p>
            <p className="leading-relaxed">เฝ้าระวังอาการน้ำลายยืด กลัวน้ำ ดุร้าย หรือพฤติกรรมเปลี่ยนไปจากปกติ ห้ามพยายามป้อนน้ำหรืออาหารด้วยมือตนเอง</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/60 p-3 rounded-lg border border-red-50">
          <PhoneCall className="shrink-0 mt-0.5 text-red-600" size={18} />
          <div>
            <p className="font-semibold text-red-900 mb-0.5">3. ติดต่อหน่วยงานที่เกี่ยวข้อง (Reporting)</p>
            <p className="leading-relaxed">รีบแจ้งสัตวแพทย์ กรมปศุสัตว์ หรือสายด่วน 1422 (กรมควบคุมโรค) เพื่อให้เจ้าหน้าที่ที่มีความเชี่ยวชาญเข้ามาดำเนินการตรวจสอบ</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-100 text-red-900 border border-red-200 rounded-lg text-xs leading-relaxed font-medium">
          <strong>คำเตือน:</strong> หากโดนสุนัขกัดหรือข่วน ให้รีบล้างแผลด้วยน้ำและสบู่ทันทีนาน 15 นาที และไปพบแพทย์โดยด่วนเพื่อฉีดวัคซีนป้องกันโรคพิษสุนัขบ้า
        </div>
      </div>
    </div>
  )
}

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
  const { prediction, confidence, risk_level, peak_frequency, processing_time_ms } = result

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

      {/* Prevention Guidelines - Conditionally Rendered */}
      {risk_level === 'risk' && <PreventionGuidelines />}

    </div>
  )
}
