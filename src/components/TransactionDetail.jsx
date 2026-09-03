import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransaction } from '../api';

function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxn = async () => {
      try {
        const res = await getTransaction(id);
        setTxn(res.data);
      } catch (err) {
        // Show dummy detail if backend not ready
        setTxn({
          txn_id: id,
          vendor: 'ABC Traders',
          amount: 499999,
          risk_score: 92,
          risk_level: 'Critical',
          evidence: 'Duplicate: Same vendor/amount within 2 hours. GST mismatch (diff ₹18,000). Backdated: Posted 15 days late.',
          anomaly_types: 'duplicate, gst_mismatch, backdated'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTxn();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!txn) return <div className="text-center py-20">Not found</div>;

  const riskColor = {
    'Critical': 'text-red-700 bg-red-100',
    'High': 'text-orange-700 bg-orange-100',
    'Medium': 'text-yellow-700 bg-yellow-100',
    'Low': 'text-green-700 bg-green-100'
  }[txn.risk_level] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6 block">
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{txn.txn_id}</h2>
            <p className="text-slate-500">Vendor: <span className="font-medium">{txn.vendor}</span></p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${riskColor}`}>
            {txn.risk_level} — Score: {txn.risk_score}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm text-slate-500">Amount</p>
            <p className="text-2xl font-bold text-slate-800">₹{txn.amount?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Anomaly Types</p>
            <p className="font-mono text-sm bg-white px-3 py-1 rounded border border-slate-200 inline-block">
              {txn.anomaly_types || 'None'}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <span className="text-xl">🧾</span> Evidence & Reasoning
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-slate-800">
            <p className="whitespace-pre-wrap">{txn.evidence}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Audit Memo
          </h3>
          <div className="bg-slate-50 rounded-xl p-5 text-slate-700 border border-slate-200">
            {txn.anomaly_types?.includes('duplicate') && (
              <p>🔴 <strong>Duplicate payment risk.</strong> Request original invoice and verify goods receipt. Ask for a credit note.</p>
            )}
            {txn.anomaly_types?.includes('gst') && (
              <p>🟠 <strong>GST mismatch.</strong> Recalculate liability. Verify input tax credit eligibility.</p>
            )}
            {txn.anomaly_types?.includes('backdated') && (
              <p>🟡 <strong>Backdated entry.</strong> Verify cut-off procedures. Confirm service delivery date.</p>
            )}
            {!txn.anomaly_types && (
              <p>✅ No specific rule violations, but ML flagged this. Review supporting documents.</p>
            )}
            <p className="text-xs text-slate-400 mt-2">* AI-generated recommendation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;