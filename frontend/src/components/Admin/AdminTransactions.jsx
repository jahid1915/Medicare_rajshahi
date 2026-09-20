import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';
import {
  CreditCard, Search, Filter, RefreshCw, ArrowRight, CheckCircle2,
  AlertCircle, Clock, RotateCcw, ShieldCheck, ChevronRight, X,
  FileText, User, Building2, Pill, Stethoscope, DollarSign, Calendar,
  ExternalLink, Check, AlertTriangle, Activity
} from 'lucide-react';

const STATUS_CONFIG = {
  successful: { label: 'Successful', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: CheckCircle2 },
  processing: { label: 'Processing', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: Activity },
  pending:    { label: 'Pending',    bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: Clock },
  initiated:  { label: 'Initiated',  bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', icon: Clock },
  refunded:   { label: 'Refunded',   bg: '#fdf4ff', color: '#9333ea', border: '#f5d0fe', icon: RotateCcw },
  failed:     { label: 'Failed',     bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: AlertCircle },
  cancelled:  { label: 'Cancelled',  bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: X },
};

const SERVICE_LABELS = {
  doctor_appointment: { label: 'Doctor Visit', icon: Stethoscope, color: '#0d7c6e' },
  pharmacy_order:     { label: 'Medicine Order', icon: Pill, color: '#2563eb' },
  hospital_admission: { label: 'Hospital Bed/Cabin', icon: Building2, color: '#7c3aed' },
  diagnostic_test:    { label: 'Diagnostic Test', icon: Activity, color: '#ea580c' },
  general:            { label: 'Healthcare Service', icon: CreditCard, color: '#64748b' }
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCount: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Selected for Transition History Modal
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [transitionNote, setTransitionNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (gatewayFilter !== 'all') params.gateway = gatewayFilter;
      if (serviceFilter !== 'all') params.service_type = serviceFilter;

      const res = await paymentsAPI.getAll(params);
      if (res.data) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter, gatewayFilter, serviceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleApplyTransition = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedTxn) return;

    setTransitioning(true);
    setActionSuccess('');
    try {
      const res = await paymentsAPI.transitionStatus(selectedTxn._id, {
        to_status: newStatus,
        note: transitionNote || `Status transitioned to ${newStatus} by platform administrator`
      });

      if (res.data) {
        setSelectedTxn(res.data);
        setActionSuccess(`Status transitioned to "${newStatus}" with audit trail.`);
        setNewStatus('');
        setTransitionNote('');
        fetchTransactions();
      }
    } catch (err) {
      alert(err.message || 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'var(--sp-6)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(13,124,110,0.1)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            <ShieldCheck style={{ width: 14, height: 14 }} /> Platform Financial & Transition Audit
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Transaction History & Status Transitions
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4, marginBottom: 0 }}>
            Real-time audit log of all healthcare payments across Rajshahi hospitals, doctors, and pharmacies.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
        >
          <RefreshCw style={{ width: 15, height: 15, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 'var(--sp-6)' }}>
        <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
            Total Settled Volume
            <span style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ৳
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0d7c6e', letterSpacing: '-0.02em' }}>
            ৳{stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '0'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            From {stats.successfulCount || 0} successful payments
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
            Successful
            <CheckCircle2 style={{ width: 20, height: 20, color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669' }}>
            {stats.successfulCount || 0}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {stats.totalCount ? Math.round((stats.successfulCount / stats.totalCount) * 100) : 0}% success rate
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
            Pending / In Progress
            <Clock style={{ width: 20, height: 20, color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706' }}>
            {stats.pendingCount || 0}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Awaiting PGW clearing
          </div>
        </div>

        <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
            Refunds & Issues
            <RotateCcw style={{ width: 20, height: 20, color: '#9333ea' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#9333ea' }}>
            {stats.refundedCount || 0} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#dc2626' }}>/ {stats.failedCount || 0} failed</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Reversed or abandoned
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', marginBottom: 'var(--sp-6)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Payment #, Txn ID, Patient Name, Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--color-border)', fontSize: 'var(--text-sm)', outline: 'none',
                background: 'var(--color-surface)'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)',
              fontSize: 'var(--text-sm)', outline: 'none', background: 'white', color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="initiated">Initiated</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>

          {/* Gateway Filter */}
          <select
            value={gatewayFilter}
            onChange={e => { setGatewayFilter(e.target.value); setPage(1); }}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)',
              fontSize: 'var(--text-sm)', outline: 'none', background: 'white', color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Gateways</option>
            <option value="sslcommerz">SSLCommerz</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="cash">Cash on Delivery</option>
          </select>

          {/* Service Type Filter */}
          <select
            value={serviceFilter}
            onChange={e => { setServiceFilter(e.target.value); setPage(1); }}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-border)',
              fontSize: 'var(--text-sm)', outline: 'none', background: 'white', color: 'var(--color-text-primary)'
            }}
          >
            <option value="all">All Services</option>
            <option value="doctor_appointment">Doctor Appointments</option>
            <option value="pharmacy_order">Pharmacy Orders</option>
            <option value="hospital_admission">Hospital Admissions</option>
            <option value="diagnostic_test">Diagnostic Tests</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 'var(--text-sm)' }}>
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw style={{ width: 32, height: 32, color: 'var(--color-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading transactions and transition history...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <AlertTriangle style={{ width: 32, height: 32, color: '#dc2626', margin: '0 auto 12px' }} />
            <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
            <button onClick={fetchTransactions} className="btn btn-secondary" style={{ marginTop: 12 }}>Try Again</button>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <CreditCard style={{ width: 40, height: 40, color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px' }}>No transactions found</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: 400, margin: '0 auto' }}>
              No transactions match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Payment Ref</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Customer & Service</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Method & Gateway</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Transition History</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => {
                  const statusInfo = STATUS_CONFIG[txn.status] || STATUS_CONFIG.initiated;
                  const serviceInfo = SERVICE_LABELS[txn.service_type] || SERVICE_LABELS.general;
                  const historyCount = txn.status_history?.length || 1;

                  return (
                    <tr
                      key={txn._id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: idx % 2 === 0 ? 'white' : 'rgba(0,0,0,0.01)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Payment Ref */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                          {txn.payment_number}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 3 }}>
                          {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer & Service */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {txn.customer_name || txn.patient_id?.name || 'Walk-in Patient'}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '2px 8px', borderRadius: 6, background: `${serviceInfo.color}15`, color: serviceInfo.color, fontSize: '11px', fontWeight: 600 }}>
                          <serviceInfo.icon style={{ width: 12, height: 12 }} />
                          {serviceInfo.label}
                        </div>
                        {txn.hospital_id && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {txn.hospital_id.name}
                          </div>
                        )}
                        {txn.pharmacy_id && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {txn.pharmacy_id.name}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          ৳{txn.amount?.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {txn.currency}
                        </span>
                      </td>

                      {/* Gateway */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, textTransform: 'capitalize' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: txn.gateway === 'cash' ? '#f59e0b' : '#0d7c6e' }} />
                          {txn.method || txn.gateway}
                        </div>
                        {txn.transaction_id && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                            ID: {txn.transaction_id.slice(0, 16)}…
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 99,
                          background: statusInfo.bg, color: statusInfo.color,
                          border: `1px solid ${statusInfo.border}`,
                          fontSize: '12px', fontWeight: 700
                        }}>
                          <statusInfo.icon style={{ width: 13, height: 13 }} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Transition History Pill */}
                      <td style={{ padding: '16px 18px' }}>
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Activity style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                          {historyCount} {historyCount === 1 ? 'Step' : 'Steps'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedTxn(txn)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Audit History <ChevronRight style={{ width: 14, height: 14 }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Showing {transactions.length} of {pagination.total} transactions
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '12px', fontWeight: 600 }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ TRANSITION HISTORY & AUDIT MODAL ═══ */}
      {selectedTxn && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-2xl)',
            width: '100%', maxWidth: 720, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}>
                    {selectedTxn.payment_number}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 99, fontSize: '11px', fontWeight: 700,
                    background: STATUS_CONFIG[selectedTxn.status]?.bg || '#f1f5f9',
                    color: STATUS_CONFIG[selectedTxn.status]?.color || '#475569'
                  }}>
                    {STATUS_CONFIG[selectedTxn.status]?.label || selectedTxn.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Amount: ৳{selectedTxn.amount?.toLocaleString()} {selectedTxn.currency} • Gateway: {selectedTxn.method || selectedTxn.gateway}
                </div>
              </div>

              <button
                onClick={() => { setSelectedTxn(null); setActionSuccess(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: 'var(--color-text-muted)' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Customer & Service Info Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, padding: '14px 16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginTop: 2 }}>{selectedTxn.customer_name || selectedTxn.patient_id?.name || 'N/A'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{selectedTxn.customer_phone || selectedTxn.patient_id?.phone || 'No phone'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Service Type</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginTop: 2, textTransform: 'capitalize' }}>
                    {selectedTxn.service_type?.replace(/_/g, ' ') || 'General Healthcare'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {selectedTxn.hospital_id?.name || selectedTxn.pharmacy_id?.name || 'Niramoy Direct'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Transaction Ref</div>
                  <div style={{ fontWeight: 700, fontSize: '12px', fontFamily: 'monospace', marginTop: 2 }}>
                    {selectedTxn.transaction_id || 'Awaiting ID'}
                  </div>
                  {selectedTxn.gateway_transaction_id && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      GW: {selectedTxn.gateway_transaction_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Transition Timeline */}
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                Status Transition Timeline ({selectedTxn.status_history?.length || 1} Events)
              </h3>

              <div style={{ position: 'relative', paddingLeft: 28, marginBottom: 28 }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: 'var(--color-border)' }} />

                {(selectedTxn.status_history && selectedTxn.status_history.length > 0 ? selectedTxn.status_history : [
                  {
                    from_status: null,
                    to_status: selectedTxn.status,
                    changed_at: selectedTxn.createdAt,
                    actor_role: 'system',
                    actor_name: 'Payment Engine',
                    note: 'Initial payment record created'
                  }
                ]).map((step, sIdx) => {
                  const sConf = STATUS_CONFIG[step.to_status] || STATUS_CONFIG.initiated;
                  const isLatest = sIdx === (selectedTxn.status_history?.length || 1) - 1;

                  return (
                    <div key={sIdx} style={{ position: 'relative', marginBottom: 20 }}>
                      {/* Timeline Node */}
                      <div style={{
                        position: 'absolute', left: -28, top: 2,
                        width: 20, height: 20, borderRadius: '50%',
                        background: isLatest ? sConf.color : 'white',
                        border: `2px solid ${sConf.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isLatest ? (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
                        ) : (
                          <Check style={{ width: 10, height: 10, color: sConf.color }} />
                        )}
                      </div>

                      {/* Transition Box */}
                      <div style={{
                        background: isLatest ? `${sConf.bg}80` : 'white',
                        border: `1.5px solid ${isLatest ? sConf.border : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-lg)', padding: '12px 16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {step.from_status && (
                              <>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                  {step.from_status}
                                </span>
                                <ArrowRight style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
                              </>
                            )}
                            <span style={{
                              padding: '2px 8px', borderRadius: 99,
                              background: sConf.bg, color: sConf.color,
                              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                            }}>
                              {sConf.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {new Date(step.changed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>

                        {/* Note & Actor */}
                        <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginTop: 6, lineHeight: 1.5 }}>
                          {step.note || 'Status transitioned successfully.'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 8 }}>
                          <span>Actor: <strong style={{ color: 'var(--color-text-primary)' }}>{step.actor_name || step.actor_role}</strong></span>
                          {step.gateway_ref && (
                            <span>GW Ref: <strong style={{ fontFamily: 'monospace' }}>{step.gateway_ref}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Success Alert */}
              {actionSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '13px', marginBottom: 20 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {actionSuccess}
                </div>
              )}

              {/* Admin Manual Transition Control */}
              <div style={{ border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', background: 'var(--color-surface)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Super Admin Status Override / Transition
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                  Manually trigger a status update with an immutable audit log entry.
                </p>

                <form onSubmit={handleApplyTransition} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      required
                      style={{
                        padding: '10px 12px', borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)', fontSize: '13px',
                        background: 'white', outline: 'none'
                      }}
                    >
                      <option value="">Transition To…</option>
                      <option value="processing">Processing</option>
                      <option value="successful">Successful (Settled)</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Reason or audit note (e.g., Doctor cancelled, verified via bank)"
                      value={transitionNote}
                      onChange={e => setTransitionNote(e.target.value)}
                      required
                      style={{
                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)', fontSize: '13px',
                        background: 'white', outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={transitioning || !newStatus}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', padding: '9px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {transitioning ? <RefreshCw style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <ShieldCheck style={{ width: 14, height: 14 }} />}
                    Apply Status Transition
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
