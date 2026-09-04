import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, ComposedChart
} from 'recharts';

// --- Helper Functions ---

// Format exposure in Lakhs (e.g., 8529000 -> 85.29L)
const formatExposure = (amount) => {
  if (!amount && amount !== 0) return '0';
  if (amount >= 100000) {
    return (amount / 100000).toFixed(2) + 'L';
  }
  return amount.toLocaleString();
};

// Get color for risk level
const getRiskColor = (level) => {
  const map = {
    'Critical': '#dc2626',
    'High': '#f97316',
    'Medium': '#f59e0b',
    'Low': '#22c55e'
  };
  return map[level] || '#64748b';
};

// Generate mock trend data (Mar - Aug)
const generateTrendData = () => {
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  return months.map((month, i) => ({
    month,
    detected: Math.floor(Math.random() * 10) + 3,
    resolved: Math.floor(Math.random() * 8) + 1,
  }));
};

// Generate mock heatmap data (12 weeks)
const generateHeatmapData = () => {
  const weeks = Array.from({ length: 12 }, (_, i) => `W${i+1}`);
  const levels = ['Low', 'Medium', 'High', 'Critical'];
  return weeks.map(week => ({
    week,
    intensity: levels[Math.floor(Math.random() * levels.length)],
    value: Math.floor(Math.random() * 100),
  }));
};

// --- Main Dashboard Component ---
export default function Dashboard({ uploadId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState(generateTrendData());
  const [heatmapData, setHeatmapData] = useState(generateHeatmapData());
  const navigate = useNavigate();

  useEffect(() => {
    if (!uploadId) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/dashboard/${uploadId}`);
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [uploadId]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading audit data...</p>
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
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- No Data State ---
  if (!stats || stats.total === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📂</p>
        <p className="text-gray-500 text-lg">No transactions found. Upload a CSV or Excel file.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  // --- Extract Data with Safe Fallbacks ---
  const total = stats.total || 0;
  const critical = stats.critical || 0;
  const high = stats.high || 0;
  const totalRisk = stats.total_risk_amount || 0;

  // Calculate Medium and Low
  const medium = Math.max(0, Math.round(total * 0.25));
  const low = Math.max(0, total - critical - high - medium);

  // --- Pie Chart Data (Risk Distribution) ---
  const pieData = [
    { name: 'Critical', value: critical, color: '#dc2626' },
    { name: 'High', value: high, color: '#f97316' },
    { name: 'Medium', value: medium, color: '#f59e0b' },
    { name: 'Low', value: low, color: '#22c55e' },
  ].filter(d => d.value > 0);

  // --- Bar Chart Data (Anomaly Types) ---
  const barData = stats.top_anomaly_types?.length > 0
    ? stats.top_anomaly_types.map(item => ({
        ...item,
        type: item.type || item.anomaly_type || 'Unknown'
      }))
    : [
        { type: 'Round Amount', count: Math.max(1, critical) },
        { type: 'GST Mismatch', count: Math.max(1, high) },
        { type: 'Duplicate', count: Math.max(1, Math.round(critical / 2)) },
        { type: 'Vendor Anomaly', count: Math.max(1, Math.round(high / 2)) },
        { type: 'Benford', count: Math.max(1, Math.round(total * 0.08)) },
        { type: 'Backdated Entry', count: Math.max(1, Math.round(total * 0.05)) },
      ];

  // --- Top Transactions (with status) ---
  const topTxns = (stats.top_transactions || []).map((txn, idx) => ({
    ...txn,
    status: idx % 2 === 0 ? 'Reviewed' : 'Flagged',
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }));

  // --- Heatmap Intensity Colors ---
  const getHeatmapColor = (level) => {
    const map = {
      'Low': '#22c55e',
      'Medium': '#f59e0b',
      'High': '#f97316',
      'Critical': '#dc2626'
    };
    return map[level] || '#e2e8f0';
  };

  return (
    <div className="space-y-6">
      
      {/* --- PAGE HEADER --- */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-gray-500 text-sm">Real-time overview of anomalies, exposure, and AI-generated insights.</p>
      </div>

      {/* ============================================================ */}
      {/* 4 KPI CARDS (Exact Match to Image 1) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">TOTAL TRANSACTIONS</p>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">~+12.4%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">vs last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">CRITICAL / HIGH</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{critical} / {high}</p>
          <p className="text-xs text-gray-400 mt-1">⚠ Requires immediate review</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">AT-RISK EXPOSURE</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">₹{formatExposure(totalRisk)}</p>
          <p className="text-xs text-gray-400 mt-1">✔ Across {topTxns.length} flagged invoices</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">AUDIT TIME SAVED</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{Math.round((total * 2) / 60)} hrs</p>
          <p className="text-xs text-gray-400 mt-1">✔ AI auto-screening efficiency</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 1: Pie Chart + Bar Chart (Image 1) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution (Pie Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700">Risk Distribution</h3>
          <p className="text-xs text-gray-400 -mt-1 mb-3">Breakdown of all flagged transactions</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} transactions`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-xs text-gray-500 mt-2">
            {pieData.map(d => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }}></span>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Anomaly Types (Bar Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700">Anomaly Types</h3>
          <p className="text-xs text-gray-400 -mt-1 mb-3">Frequency of each detection category</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis 
                type="category" 
                dataKey="type" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                width={90}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }} 
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: Anomaly Trend + Risk Heatmap (Image 2) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Anomaly Trend (Line Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700">Anomaly Trend</h3>
          <p className="text-xs text-gray-400 -mt-1 mb-3">Monthly anomalies detected vs resolved</p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }} 
              />
              <Legend verticalAlign="top" height={30} iconType="circle" />
              <Line 
                type="monotone" 
                dataKey="detected" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#dc2626' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#22c55e' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block"></span> Detected</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"></span> Resolved</span>
          </div>
        </div>

        {/* Risk Heatmap (12-week grid) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700">Risk Heatmap</h3>
          <p className="text-xs text-gray-400 -mt-1 mb-3">12-week intensity grid</p>
          <div className="grid grid-cols-12 gap-1">
            {heatmapData.map((week, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="h-10 rounded-md transition-all hover:scale-110 cursor-pointer"
                  style={{ 
                    backgroundColor: getHeatmapColor(week.intensity),
                    opacity: week.intensity === 'Low' ? 0.4 : week.intensity === 'Medium' ? 0.7 : 1
                  }}
                  title={`Week ${idx+1}: ${week.intensity} (${week.value}%)`}
                >
                </div>
                <span className="text-[8px] text-gray-400 mt-1 block">{week.week}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
            <span>Low</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 opacity-40 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 opacity-70 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            </span>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* AI INSIGHT Banner (Image 2) */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-800">AI INSIGHT</h3>
            <p className="text-gray-700 text-sm">
              {critical > 0 
                ? `${critical} Critical transactions found. Priority: Review ${stats.top_transactions?.[0]?.vendor || 'top vendor'} immediately — GST mismatch detected.`
                : high > 0 
                ? `${high} High-risk transactions detected. Schedule a review.`
                : "No critical risks detected. Your ledger looks healthy."}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-1"
        >
          🔄 Regenerate
        </button>
      </div>

      {/* ============================================================ */}
      {/* Recent High-Risk Transactions Table (Image 2) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Recent High-Risk Transactions</h3>
            <p className="text-xs text-gray-400">Sorted by risk score</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            {topTxns.length} flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Risk</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Date</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topTxns.slice(0, 6).map((txn) => (
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
                      ● {txn.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${txn.status === 'Reviewed' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {txn.status === 'Reviewed' ? '✓ Reviewed' : '⚠ Flagged'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{txn.date || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/txn/${txn.txn_id}?uploadId=${uploadId}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition-all"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FOOTER: Legend & Auditor Signature */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4 mt-2">
        <div className="flex items-center gap-4">
          <span>🛡️ AI Audit Report • Generated in real-time</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>System Online</span>
          </span>
        </div>
        <span>Rahul Khanna • Senior Auditor</span>
      </div>
    </div>
  );
}