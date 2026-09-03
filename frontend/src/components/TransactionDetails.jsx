import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

function TransactionDetails({ uploadId: propUploadId }) {
  const { txnId } = useParams();
  const [searchParams] = useSearchParams();
  const uploadId = propUploadId || searchParams.get('uploadId');
  const navigate = useNavigate();
  
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uploadId || !txnId) {
      setLoading(false);
      return;
    }
    axios.get(`/api/txn/${txnId}`)
      .then(res => {
        setTxn(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Transaction fetch error:', err);
        setError('Transaction not found or API error.');
        setLoading(false);
      });
  }, [txnId, uploadId]);

  const copyToClipboard = () => {
    if (!txn?.ai_memo) return;
    navigator.clipboard.writeText(txn.ai_memo);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !txn) {
    return (
      <div className="text-center py-20 glass rounded-2xl">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-slate-500">{error || 'Transaction not found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors">
        <span>←</span> <span>Back to Dashboard</span>
      </button>

      {/* Transaction Header */}
      <div className="glass rounded-2xl p-6 card-hover flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-800 font-mono">{txn.txn_id}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold
              ${txn.risk_level === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                txn.risk_level === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                txn.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {txn.risk_level}
            </span>
          </div>
          <p className="text-slate-500 mt-1"><span className="font-medium">Vendor:</span> {txn.vendor}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Amount</p>
          <p className="text-3xl font-bold text-slate-800">₹{txn.amount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Evidence & Risk Score Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass rounded-2xl p-6 card-hover">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📋 Evidence</h4>
          <p className="text-slate-700 leading-relaxed">{txn.evidence || 'No specific rule flags, but ML suggests review.'}</p>
          {txn.anomaly_types && (
            <div className="flex flex-wrap gap-2 mt-4">
              {txn.anomaly_types.split(',').map((type, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                  {type.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass rounded-2xl p-6 card-hover flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Score</p>
          <div className="relative w-24 h-24 mt-2">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
              <circle cx="48" cy="48" r="40" stroke={txn.risk_score > 80 ? '#ef4444' : txn.risk_score > 60 ? '#f97316' : '#fbbf24'} 
                      strokeWidth="8" fill="none" 
                      strokeDasharray={`${(txn.risk_score / 100) * 251.2} 251.2`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{txn.risk_score}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">out of 100</p>
        </div>
      </div>

      {/* --- AI MEMO (The Star Feature) --- */}
      <div className="glass rounded-2xl p-6 card-hover border-l-8 border-l-indigo-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">🤖</span>
            <h3 className="font-bold text-slate-800">AI Auditor's Memo</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Powered by LLM</span>
          </div>
          <button 
            onClick={copyToClipboard}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${copySuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy Memo'}
          </button>
        </div>
        
        <div className="prose prose-sm max-w-none text-slate-700 bg-white/50 p-4 rounded-xl border border-slate-100/60 whitespace-pre-wrap">
          {txn.ai_memo || 'Generating AI insights...'}
        </div>
        
        <p className="text-[10px] text-slate-400 mt-4 flex items-center space-x-2">
          <span>🛡️ This memo is AI-generated and should be reviewed by a qualified professional.</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          Mark as Reviewed
        </button>
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50">
          📄 Export Report
        </button>
      </div>
    </div>
  );
}

export default TransactionDetails;