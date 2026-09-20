import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, AlertTriangle, CheckCircle, TrendingUp, Cpu, Sparkles, ArrowRight } from 'lucide-react';

export default function WhatIfSimulator() {
  // Input Simulation Parameters (Sliders)
  const [erArrivalsSurge, setErArrivalsSurge] = useState(30); // +%
  const [icuBedsDelta, setIcuBedsDelta] = useState(-10); // %
  const [doctorsAvailabilityDelta, setDoctorsAvailabilityDelta] = useState(-20); // %
  const [labCapacityDelta, setLabCapacityDelta] = useState(15); // %

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRun, setSimulationRun] = useState(true);

  const resetParameters = () => {
    setErArrivalsSurge(0);
    setIcuBedsDelta(0);
    setDoctorsAvailabilityDelta(0);
    setLabCapacityDelta(0);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationRun(true);
    }, 600);
  };

  // Base Baseline Metrics
  const baseWaitTime = 24; // mins
  const baseBedOccupancy = 78; // %
  const baseStaffWorkload = 72; // %
  const baseLabQueue = 42; // cases

  // Simulated Math Calculations
  const simWaitTime = Math.round(baseWaitTime * (1 + (erArrivalsSurge * 0.015) - (doctorsAvailabilityDelta * 0.012)));
  const simBedOccupancy = Math.min(100, Math.round(baseBedOccupancy + (erArrivalsSurge * 0.4) - (icuBedsDelta * 0.5)));
  const simStaffWorkload = Math.min(100, Math.round(baseStaffWorkload + (erArrivalsSurge * 0.5) - (doctorsAvailabilityDelta * 0.6)));
  const simLabQueue = Math.max(5, Math.round(baseLabQueue * (1 + (erArrivalsSurge * 0.01) - (labCapacityDelta * 0.01))));

  const isSevereBottleneck = simBedOccupancy > 90 || simWaitTime > 45 || simStaffWorkload > 90;

  return (
    <div style={{ padding: '24px', color: 'var(--text-main)' }}>
      {/* Header Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">🎮 Hospital "What-If" Control Room</span>
            <span className="badge badge-info">Monte Carlo Scenario Engine</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Operational Scenario Simulator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Test hypothetical emergency surges, staff shortages, or capacity changes to predict hospital bottlenecks before they occur.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={resetParameters} className="btn btn-secondary">
            <RotateCcw style={{ width: 16, height: 16 }} /> Reset Defaults
          </button>
          <button onClick={handleRunSimulation} disabled={isSimulating} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            {isSimulating ? <Sparkles className="animate-spin" style={{ width: 16, height: 16 }} /> : <Play style={{ width: 16, height: 16 }} />}
            {isSimulating ? 'Running Model...' : 'Execute Simulation'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* LEFT COLUMN: SIMULATION CONTROLS */}
        <div className="dashboard-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders style={{ width: 18, height: 18, color: 'var(--primary)' }} /> Scenario Parameters
          </h3>

          {/* Slider 1: Emergency Arrivals */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Emergency Arrivals Volume</span>
              <span style={{ color: erArrivalsSurge > 0 ? '#ef4444' : 'var(--text-muted)' }}>+{erArrivalsSurge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={erArrivalsSurge}
              onChange={(e) => setErArrivalsSurge(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Baseline</span>
              <span>+50% Surge</span>
              <span>+100% Surge</span>
            </div>
          </div>

          {/* Slider 2: ICU Bed Capacity Change */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>ICU Bed Capacity Adjustment</span>
              <span style={{ color: icuBedsDelta < 0 ? '#ef4444' : '#10b981' }}>{icuBedsDelta > 0 ? `+${icuBedsDelta}%` : `${icuBedsDelta}%`}</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={icuBedsDelta}
              onChange={(e) => setIcuBedsDelta(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-40% Beds</span>
              <span>Standard</span>
              <span>+40% Beds</span>
            </div>
          </div>

          {/* Slider 3: Doctors Availability */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>On-Call Doctor Availability</span>
              <span style={{ color: doctorsAvailabilityDelta < 0 ? '#ef4444' : '#10b981' }}>{doctorsAvailabilityDelta > 0 ? `+${doctorsAvailabilityDelta}%` : `${doctorsAvailabilityDelta}%`}</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              value={doctorsAvailabilityDelta}
              onChange={(e) => setDoctorsAvailabilityDelta(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-40% Staff</span>
              <span>Normal</span>
              <span>+40% Staff</span>
            </div>
          </div>

          {/* Slider 4: Lab Processing Speed */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Laboratory Capacity</span>
              <span style={{ color: labCapacityDelta < 0 ? '#ef4444' : '#10b981' }}>{labCapacityDelta > 0 ? `+${labCapacityDelta}%` : `${labCapacityDelta}%`}</span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              value={labCapacityDelta}
              onChange={(e) => setLabCapacityDelta(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>-30% Lab</span>
              <span>Normal</span>
              <span>+50% Lab</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT VS SIMULATED COMPARISON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Side-by-Side Comparison Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Metric 1: Wait Time */}
            <div className="dashboard-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Triage Wait Time</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{baseWaitTime} m</div>
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>SIMULATED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: simWaitTime > baseWaitTime ? '#ef4444' : '#10b981' }}>
                    {simWaitTime} m
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '8px', color: simWaitTime > baseWaitTime ? '#ef4444' : '#10b981' }}>
                {simWaitTime > baseWaitTime ? `+${simWaitTime - baseWaitTime} mins delay` : `${simWaitTime - baseWaitTime} mins reduction`}
              </div>
            </div>

            {/* Metric 2: Bed Occupancy */}
            <div className="dashboard-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Bed Occupancy</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{baseBedOccupancy}%</div>
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>SIMULATED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: simBedOccupancy > 88 ? '#ef4444' : '#10b981' }}>
                    {simBedOccupancy}%
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '8px', color: simBedOccupancy > 88 ? '#ef4444' : '#10b981' }}>
                {simBedOccupancy > 88 ? '⚠️ High Overcrowding Risk' : 'Optimal Capacity Zone'}
              </div>
            </div>

            {/* Metric 3: Staff Workload */}
            <div className="dashboard-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Staff Strain Index</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CURRENT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{baseStaffWorkload}%</div>
                </div>
                <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>SIMULATED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: simStaffWorkload > 85 ? '#ef4444' : '#10b981' }}>
                    {simStaffWorkload}%
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '8px', color: simStaffWorkload > 85 ? '#ef4444' : '#10b981' }}>
                {simStaffWorkload > 85 ? 'Severe Burnout Risk' : 'Manageable Load'}
              </div>
            </div>
          </div>

          {/* AI OPERATIONAL RECOMMENDATIONS */}
          <div className="dashboard-card" style={{ borderLeft: isSevereBottleneck ? '4px solid #ef4444' : '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Cpu style={{ width: 18, height: 18, color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>AI Scenario Analysis & Recommended Operational Adjustments</h3>
            </div>

            {isSevereBottleneck ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle style={{ width: 16, height: 16 }} /> Critical Bottleneck Threshold Exceeded
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Simulated parameters indicate an impending ER queue stall within 2.5 hours. Recommended actions:
                </p>
                <ul style={{ fontSize: '0.8rem', marginTop: '8px', paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li>Authorize 15 Emergency Overflow beds in Ward B immediately.</li>
                  <li>Call in 4 On-Demand Triage Nurses from reserve shift pool.</li>
                  <li>Prioritize rapid-turnaround blood panel processing in Central Lab.</li>
                </ul>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle style={{ width: 16, height: 16 }} /> Stable Operational Equilibrium
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Simulated load remains within normal hospital safety buffer parameters.
                </p>
              </div>
            )}

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-canvas)', padding: '8px', borderRadius: '6px' }}>
              ℹ️ Mandatory Safety Notice: Every recommendation listed above is an AI-generated planning suggestion designed for decision support. Final operational changes must be reviewed and signed off by the Hospital Administrator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
