import React, { useState } from 'react';
import { Store, Sparkles, TrendingUp } from 'lucide-react';
import { PHARMACIES } from '../../data/pharmacies';

export default function PharmacyDashboard() {
  const pharmacy = PHARMACIES[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <div className="section-header">
            <h2><div className="section-icon" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent)' }}><Store style={{ width: 22, height: 22 }} /></div>
              {pharmacy.name}</h2>
            <p>Partner Pharmacy Dashboard — Stock Management & ML Demand Prediction.</p>
          </div>
          <span className="live-pulse" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
            <span className="live-pulse-dot" /> Active
          </span>
        </div>
      </div>

      {/* ML Demand Forecasting */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)', borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles style={{ width: 18, height: 18, color: 'var(--accent)' }} className="animate-float" />
            <h3 style={{ fontSize: '1rem', fontWeight: 750 }}>ML Demand Prediction Engine</h3>
          </div>
          <span className="badge badge-accent">Model v2.4</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
          Analyzes epidemiological trends, weather data, and historical prescription velocity to forecast stock demand.
        </p>

        <div className="grid-responsive-3">
          {pharmacy.mlDemandForecasting.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: 'var(--space-5)', animation: `fadeIn 0.3s var(--ease-out) ${i * 0.08}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{f.medicine}</span>
                <span className={`badge ${f.riskLevel.includes('High') ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.5625rem' }}>
                  <TrendingUp style={{ width: 10, height: 10 }} /> {f.demandTrend}
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>"{f.reason}"</p>
              <span style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                Action: Restock Recommended
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card" style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 750, marginBottom: 'var(--space-4)' }}>Live Stock Inventory</h3>
        <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pharmacy.inventory.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 650 }}>{item.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.unit}</td>
                  <td style={{ fontWeight: 700 }}>{item.stockCount}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{pharmacy.currency}{item.price}</td>
                  <td><span className="badge badge-success" style={{ fontSize: '0.5625rem' }}>In Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
