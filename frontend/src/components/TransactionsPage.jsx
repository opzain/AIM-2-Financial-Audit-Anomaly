import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransactionsPage({ uploadId }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  // --- Fetch transactions ---
  useEffect(() => {
    if (!uploadId) {
      setLoading(false);
      return;
    }
    fetch(`/api/transactions/${uploadId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load transactions');
        return res.json();
      })
      .then(data => {
        setTransactions(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [uploadId]);

  // --- Apply filters ---
  useEffect(() => {
    let result = transactions;
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        t.txn_id?.toLowerCase().includes(term) ||
        t.vendor?.toLowerCase().includes(term)
      );
    }
    // Risk filter
    if (riskFilter !== 'All') {
      result = result.filter(t => t.risk_level === riskFilter);
    }
    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }
    setFiltered(result);
  }, [searchTerm, riskFilter, statusFilter, transactions]);

  // --- Export to CSV ---
  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['ID', 'Vendor', 'Amount', 'Risk Level', 'Risk Score', 'Status', 'Date', 'Tags'];
    const rows = filtered.map(t => [
      t.txn_id,
      t.vendor,
      t.amount,
      t.risk_level,
      t.risk_score,
      t.status,
      t.date,
      t.tags.join(', ')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
        <p className="text-red-600 font-medium">⚠️ {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- No data ---
  if (!transactions.length) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-500 text-lg">No transactions found. Upload a file first.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- Page Header --- */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm">Browse, filter, and investigate all flagged transactions.</p>
      </div>

      {/* --- Search & Filters --- */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by vendor or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="All">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="All">All</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Export
        </button>
      </div>

      {/* --- Results Count --- */}
      <div className="text-sm text-gray-500">
        Showing {filtered.length} of {transactions.length} transactions
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">VENDOR</th>
                <th className="px-6 py-3 text-right">AMOUNT</th>
                <th className="px-6 py-3 text-center">RISK</th>
                <th className="px-6 py-3 text-center">SCORE</th>
                <th className="px-6 py-3 text-center">STATUS</th>
                <th className="px-6 py-3 text-center">DATE</th>
                <th className="px-6 py-3 text-center">TAGS</th>
                <th className="px-6 py-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((txn) => (
                <tr key={txn.txn_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{txn.txn_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{txn.vendor}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800">
                    ₹{txn.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${txn.risk_level === 'Critical' ? 'bg-red-100 text-red-700' : 
                        txn.risk_level === 'High' ? 'bg-orange-100 text-orange-700' : 
                        txn.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'}`}>
                      {txn.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {txn.risk_score}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${txn.status === 'Reviewed' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {txn.status === 'Reviewed' ? 'Reviewed' : 'Flagged'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {txn.date ? new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {txn.tags && txn.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/txn/${txn.txn_id}?uploadId=${uploadId}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition-all"
                    >
                      Investigate →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}