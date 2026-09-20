import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Radio, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Server } from 'lucide-react';

export default function IotTelemetryDashboard() {
  const [mqttStatus, setMqttStatus] = useState('CONNECTED');
  const [activeSensorsCount, setActiveSensorsCount] = useState(48);
  const [telemetryFeed, setTelemetryFeed] = useState([
    { id: 'ESP32-ICU-101', location: 'ICU Room 101 (Bed-101)', type: 'Multi-Parameter Patient Monitor', heartRate: 74, spo2: 98, temp: 36.8, bp: '120/78', status: 'Normal', lastPacketMs: '42ms ago' },
    { id: 'ESP32-ICU-104', location: 'ICU Room 104 (Bed-104)', type: 'Ventilator & Vitals Gateway', heartRate: 112, spo2: 91, temp: 38.2, bp: '142/92', status: 'Abnormal Vitals Alert', lastPacketMs: '18ms ago' },
    { id: 'ESP32-ER-202', location: 'Emergency Bay 2', type: 'Wearable Patch Telemetry', heartRate: 82, spo2: 97, temp: 37.1, bp: '124/82', status: 'Normal', lastPacketMs: '105ms ago' },
    { id: 'ESP32-WARD-305', location: 'Surgical Ward B-305', type: 'Room Occupancy & Environmental', heartRate: 68, spo2: 99, temp: 36.5, bp: '118/74', status: 'Normal', lastPacketMs: '210ms ago' }
  ]);

  // Live Packet Streaming Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryFeed(prev => prev.map(item => ({
        ...item,
        heartRate: Math.max(50, Math.min(140, item.heartRate + Math.floor((Math.random() - 0.5) * 4))),
        spo2: item.status.includes('Abnormal') ? Math.max(88, Math.min(94, item.spo2 + Math.floor((Math.random() - 0.5) * 2))) : Math.max(95, Math.min(100, item.spo2 + Math.floor((Math.random() - 0.5) * 2))),
        lastPacketMs: `${Math.floor(10 + Math.random() * 80)}ms ago`
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">📡 IoT Smart Hospital Hub</span>
            <span className="badge badge-success">ESP32 MQTT Broker Connected</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Remote Patient Monitoring & IoT Telemetry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Real-time MQTT telemetry stream parsing vitals (HR, SpO2, Temp, BP) and hospital room occupancy sensors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio className="animate-pulse" style={{ width: 16, height: 16 }} /> MQTT Broker: tcp://mqtt.meditwin.hospital:1883
          </div>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE MAP CARD */}
      <div className="dashboard-card" style={{ marginBottom: '24px', background: 'var(--bg-canvas)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
          📐 System Hardware Pipeline Architecture (Requirement #24):
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
          <span style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>ESP32 Sensor Nodes</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>MQTT Gateway</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>TimescaleDB Storage</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', background: 'var(--primary)', color: '#fff', borderRadius: '6px' }}>MediTwin Real-Time Dashboard</span>
        </div>
      </div>

      {/* TELEMETRY FEED LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {telemetryFeed.map((node) => {
          const isAbnormal = node.status.includes('Abnormal') || node.spo2 < 92 || node.heartRate > 105;
          return (
            <div key={node.id} className="dashboard-card" style={{ borderLeft: isAbnormal ? '4px solid #ef4444' : '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-primary">{node.id}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{node.lastPacketMs}</span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{node.location}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{node.type}</div>

              {/* Vitals Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: 'var(--bg-canvas)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Heart Rate</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: node.heartRate > 105 ? '#ef4444' : '#10b981' }}>
                    {node.heartRate} <span style={{ fontSize: '0.65rem' }}>BPM</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-canvas)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Oxygen SpO2</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: node.spo2 < 93 ? '#ef4444' : '#3b82f6' }}>
                    {node.spo2}%
                  </div>
                </div>

                <div style={{ background: 'var(--bg-canvas)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Temperature</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{node.temp}°C</div>
                </div>

                <div style={{ background: 'var(--bg-canvas)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Blood Pressure</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{node.bp}</div>
                </div>
              </div>

              {isAbnormal ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle style={{ width: 14, height: 14 }} /> Threshold Alert: Abnormal Vitals Detected
                </div>
              ) : (
                <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: 14, height: 14 }} /> Sensor Telemetry Normal
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
