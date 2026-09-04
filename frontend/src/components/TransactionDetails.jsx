import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// --- Helper: Format date ---
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// --- Helper: Generate mock timeline based on transaction date ---
const generateTimeline = (createdDate) => {
  const base = createdDate ? new Date(createdDate) : new Date();
  base.setHours(0, 0, 0, 0);
  
  const timelines = [
    { label: 'Transaction Created', time: new Date(base), status: 'completed' },
    { label: 'AI Analysis Complete', time: new Date(base.getTime() + 60 * 60 * 1000), status: 'completed' },
    { label: 'Reviewed by Auditor', time: new Date(base.getTime() + 2 * 60 * 60 * 1000), status: 'completed' },
    { label: 'Resolution', time: null, status: 'pending' },
  ];
  
  return timelines.map(t => ({
    ...t,
    timeStr: t.time ? t.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Pending'
  }));
};

// --- Main Component ---
export default function TransactionDetails({ uploadId: propUploadId }) {
  const { txnId } = useParams();
  const [searchParams] = useSearchParams();
  const uploadId = propUploadId || searchParams.get('uploadId');
  const navigate = useNavigate();
  
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeline] = useState(generateTimeline(new Date()));

  useEffect(() => {
    if (!uploadId || !txnId) {
      setLoading(false);
      return;
    }
    fetch(`/api/txn/${txnId}`)
      .then(res => {
        if (!res.ok) throw new Error('Transaction not found');
        return res.json();
      })
      .then(data => {
        setTxn(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [txnId, uploadId]);

  const copyToClipboard = () => {
    if (!txn?.ai_memo) return;
    navigator.clipboard.writeText(txn.ai_memo);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
        <p className="text-red-600 font-medium">⚠️ {error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-3 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- No Data ---
  if (!txn) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-gray-500 text-lg">Transaction not found.</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Calculate GST ---
  const amount = txn.amount || 0;
  const gstRate = 18; // Assuming 18% for demo
  const gstExpected = amount * (gstRate / 100);
  const gstActual = txn.gst_amount || 0;
  const discrepancy = Math.abs(gstActual - gstExpected);

  // --- Determine if duplicate evidence exists ---
  const hasDuplicate = txn.evidence && txn.evidence.toLowerCase().includes('duplicate');
  const duplicateTxnId = hasDuplicate ? 'TXN-1035' : null;

  // --- Format evidence for display ---
  const displayEvidence = txn.evidence || 'No specific flags. Transaction appears normal.';

  // --- Risk level styling ---
  const riskColor = txn.risk_level === 'Critical' ? 'text-red-700 bg-red-100 border-red-200' :
                    txn.risk_level === 'High' ? 'text-orange-700 bg-orange-100 border-orange-200' :
                    txn.risk_level === 'Medium' ? 'text-amber-700 bg-amber-100 border-amber-200' :
                    'text-emerald-700 bg-emerald-100 border-emerald-200';

  const riskBadgeBg = txn.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                      txn.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                      txn.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ============================================================ */}
      {/* BREADCRUMB */}
      {/* ============================================================ */}
      <div className="text-sm text-gray-400">
        <span className="text-gray-600">Home</span>
        <span className="mx-2">›</span>
        <span className="text-gray-600">Transaction Detail</span>
      </div>

      {/* ============================================================ */}
      {/* HEADER: TXN ID, Risk Badge, Vendor, Amount, Date */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 font-mono">{txn.txn_id}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeBg} border-current`}>
              {txn.risk_level || 'Medium'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{txn.vendor || 'Unknown Vendor'}</span>
            <span className="mx-2">·</span>
            <span className="font-semibold text-gray-800">₹{amount.toLocaleString()}</span>
            <span className="mx-2">·</span>
            <span>{formatDate(txn.date)}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RISK ASSESSMENT + GAUGE */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left: Risk Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                <circle 
                  cx="64" cy="64" r="54" 
                  stroke={txn.risk_score > 80 ? '#dc2626' : txn.risk_score > 60 ? '#f97316' : '#f59e0b'} 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray={`${(txn.risk_score / 100) * 339.3} 339.3`} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{txn.risk_score || 0}</span>
                <span className="text-[10px] text-gray-400">Risk Score</span>
              </div>
            </div>
          </div>

          {/* Middle: High-Risk Vendor & Recurring */}
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400">High-Risk Vendor</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                Single Flag
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Recurring</p>
              <p className="text-sm text-gray-600">—</p>
            </div>
          </div>

          {/* Right: Transaction Amount & GST Breakdown */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Transaction Amount</span>
              <span className="font-medium text-gray-800">₹{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">GST Expected (18%)</span>
              <span className="font-medium text-gray-800">₹{gstExpected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">GST Actual</span>
              <span className="font-medium text-gray-800">₹{gstActual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discrepancy</span>
              <span className={`font-medium ${discrepancy > 1000 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹{discrepancy.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ACTION BUTTONS: Mark as Reviewed, Add Note, Flag, Export PDF */}
      {/* ============================================================ */}
      <div className="flex flex-wrap gap-3">
        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          ✓ Mark as Reviewed
        </button>
        <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          ✏️ Add Note
        </button>
        <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          🚩 Flag
        </button>
        <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          📄 Export PDF
        </button>
      </div>

      {/* ============================================================ */}
      {/* DUPLICATE ALERT */}
      {/* ============================================================ */}
      {hasDuplicate && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">Duplicate</p>
              <p className="text-sm text-red-600">
                <span className="font-medium">High</span>: Matching amount ₹{amount.toLocaleString()} found in {duplicateTxnId || 'another transaction'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AI-GENERATED AUDIT MEMO */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700">AI-Generated Audit Memo</h3>
          <button 
            onClick={copyToClipboard}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${copySuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
        <div className="bg-gray-50 border-l-4 border-l-blue-500 p-4 rounded-r-lg text-sm text-gray-700 leading-relaxed">
          {txn.ai_memo || txn.evidence || 'During our audit procedures, this transaction was identified with potential anomalies. Recommend obtaining vendor confirmation, inspecting underlying source documents, and performing substantive testing.'}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">
          🛡️ AI-generated insight — review by a qualified professional is recommended.
        </p>
      </div>

      {/* ============================================================ */}
      {/* ACTIVITY TIMELINE + INTERNAL NOTE (Side by Side) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h3>
          <div className="space-y-4 relative">
            {/* Vertical line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10
                  ${item.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-200 border-gray-300'}`}>
                  {item.status === 'completed' && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.timeStr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Note */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Internal Note</h3>
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              ✏️ Edit
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-100">
            Confirmed with vendor via email on 28-Aug. Supporting docs received and verified.
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            📎 Last updated: 28 Aug 2026, 02:30 PM
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BACK BUTTON */}
      {/* ============================================================ */}
      <div className="flex justify-end">
        <button 
          onClick={() => navigate(-1)} 
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

    </div>
  );
}