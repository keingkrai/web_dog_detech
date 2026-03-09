import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { MapPin, AlertTriangle, ShieldAlert } from 'lucide-react'

export default function RiskAreas() {
  const [riskEntries, setRiskEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('https://web-dog-detech.onrender.com/history')
        // Filter only risk cases that have latitude and longitude
        const risks = data.entries.filter(e => e.risk_level === 'risk' && e.latitude && e.longitude)
        setRiskEntries(risks)
      } catch (err) {
        console.error("Failed to fetch history for map:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Default center (Bangkok) if no risk data
  const center = riskEntries.length > 0
    ? [riskEntries[0].latitude, riskEntries[0].longitude]
    : [13.7563, 100.5018]

  return (
    <div className="space-y-4 md:space-y-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">พื้นที่เสี่ยง (Risk Areas Map)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Visualize 2km risk radius of documented rabies acoustic detections</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2">
            <AlertTriangle size={18} />
            <div className="flex flex-col">
              <span className="text-[10px] text-red-500 uppercase font-bold leading-none mb-0.5">Total Risk Cases</span>
              <span className="font-semibold text-sm leading-none">{riskEntries.length} Detected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2 flex-1 relative overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Loading map data...</p>
          </div>
        ) : (
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-100 z-0 relative">
            <MapContainer 
              center={center} 
              zoom={riskEntries.length > 0 ? 12 : 6} 
              style={{ height: '100%', width: '100%', minHeight: '400px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {riskEntries.map(entry => (
                <Circle 
                  key={entry.id} 
                  center={[entry.latitude, entry.longitude]}
                  radius={1000} /* 2000 meters = 2 km */
                  pathOptions={{ 
                    color: '#ef4444',     /* Red border */
                    fillColor: '#fca5a5', /* Light red fill */
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <div className="flex items-center gap-2 text-red-600 mb-2 border-b border-red-100 pb-2">
                        <ShieldAlert size={16} />
                        <span className="font-bold">Risk Zone (2km Radius)</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1"><strong>Date Detected:</strong> {entry.date}</p>
                      <p className="text-xs text-slate-600 mb-1"><strong>Confidence:</strong> {Math.round(entry.confidence * 100)}%</p>
                      <p className="text-xs text-slate-600"><strong>Peak Freq:</strong> {entry.peak_frequency} Hz</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}
