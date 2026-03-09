import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ShieldOff, Server, Cpu, Info, User, Mail, Building2, Save, Loader2 } from 'lucide-react'

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
  const [profile, setProfile] = useState({ full_name: '', email: '', organization: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = JSON.parse(localStorage.getItem('ascrd_user'))?.token;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            full_name: data.full_name || '',
            email: data.email || '',
            organization: data.organization || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile(); else setIsLoading(false);
  }, [token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:8000/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <SettingsIcon size={20} className="text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Settings & Profile</h2>
          <p className="text-slate-400 text-sm">Manage your account and system configuration</p>
        </div>
      </div>

      <Section title="User Profile">
        {isLoading ? (
          <div className="py-8 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50"
                    placeholder="Dr. John Doe"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50"
                    placeholder="john@example.com"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Organization / Clinic</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50"
                    placeholder="Central Veterinary Hospital"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Section>

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
