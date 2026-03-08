import React, { useState, useRef, useCallback } from 'react'
import { Upload, Mic, MicOff, FileAudio, X, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

export default function AudioInput({ onResult }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const fileRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFile = (file) => {
    setError(null)
    if (!file.name.match(/\.(wav|mp3|ogg|webm|m4a|flac)$/i)) {
      setError('Please upload an audio file (.wav, .mp3, .ogg, .webm)')
      return
    }
    setSelectedFile(file)
  }

  const submitForAnalysis = async (file) => {
    setIsAnalyzing(true)
    setError(null)
    
    // Try to get location
    let lat = null
    let lng = null
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        lat = position.coords.latitude
        lng = position.coords.longitude
      }
    } catch (e) {
      console.warn("Could not get location:", e)
    }

    const formData = new FormData()
    formData.append('file', file)
    if (lat && lng) {
      formData.append('latitude', lat)
      formData.append('longitude', lng)
    }

    try {
      const { data } = await axios.post('http://localhost:8000/analyze/full', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      })
      onResult(data)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Analysis failed'
      setError(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' })
        setSelectedFile(file)
        clearInterval(timerRef.current)
        setRecordingSeconds(0)
      }
      mr.start(100)
      mediaRecorderRef.current = mr
      setIsRecording(true)
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-5 flex flex-col items-center gap-2
          ${isDragging ? 'drop-active' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
          ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          <Upload size={24} className={isDragging ? 'text-blue-600' : 'text-slate-400'} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">Drag & drop audio file here</p>
          <p className="text-sm text-slate-400 mt-1">or click to browse — .wav, .mp3, .ogg, .webm supported</p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">or record live</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex justify-center flex-1">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #01579b, #0277bd)' }}
          >
            <Mic size={18} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold shadow-lg animate-risk"
            style={{ background: '#c62828' }}
          >
            <MicOff size={18} />
            Stop — {fmt(recordingSeconds)}
          </button>
        )}
      </div>

      {/* Selected File Card */}
      {selectedFile && !isAnalyzing && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50">
          <FileAudio size={20} className="text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && (
        <button
          onClick={() => submitForAnalysis(selectedFile)}
          disabled={isAnalyzing}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #01579b, #0277bd)' }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing Audio...
            </>
          ) : (
            'Analyze Bark Pattern'
          )}
        </button>
      )}
    </div>
  )
}
