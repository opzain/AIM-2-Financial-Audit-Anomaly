import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import TransactionDetails from './components/TransactionDetails';
import TransactionsPage from './components/TransactionsPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import AiInsightsPage from './components/AiInsightsPage';

// --- SIDEBAR ---
function Sidebar({ uploadId }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/', label: 'Upload', icon: '📤' },
    { path: '/transactions', label: 'Transactions', icon: '📋' },
    { path: '/ai-insights', label: 'AI Insights', icon: '🧠' },
    { path: '/reports', label: 'Reports', icon: '📄' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className={`glass-dark text-slate-300 h-screen sticky top-0 transition-all duration-300 flex flex-col border-r border-white/5 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-white tracking-tight">AuditCopilot</span>
                <p className="text-[10px] text-indigo-300 tracking-wider font-medium">AI AUDIT PLATFORM</p>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white transition">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 text-[10px] text-slate-500">
        {!collapsed && <span>v2.0 • AI Powered</span>}
      </div>
    </aside>
  );
}

// --- HEADER ---
function Header() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-white/20 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800">Audit Dashboard</h2>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Live</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-slate-400">👤</span>
        <span className="text-sm text-slate-600 font-medium">CA User</span>
      </div>
    </header>
  );
}

// --- MAIN APP CONTENT ---
function AppContent() {
  const [uploadId, setUploadId] = useState(null);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar uploadId={uploadId} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Upload setUploadId={setUploadId} />} />
            <Route path="/dashboard" element={<Dashboard uploadId={uploadId} />} />
            <Route path="/txn/:txnId" element={<TransactionDetails uploadId={uploadId} />} />
            <Route path="/transactions" element={<TransactionsPage uploadId={uploadId} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage uploadId={uploadId} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}