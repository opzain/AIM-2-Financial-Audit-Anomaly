import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import TransactionDetails from './components/TransactionDetails';

function App() {
  const [uploadId, setUploadId] = useState(null);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* --- GLASS NAVIGATION --- */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Audit<span className="text-gradient">Copilot</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                v2.0
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-slate-500">
                <span className={`px-3 py-1.5 rounded-lg transition-all ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`}>
                  <Link to="/">📤 Upload</Link>
                </span>
                {uploadId && (
                  <span className={`px-3 py-1.5 rounded-lg transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`}>
                    <Link to="/dashboard">📊 Dashboard</Link>
                  </span>
                )}
              </div>
              {/* Live Status Dot */}
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Upload setUploadId={setUploadId} />} />
          <Route path="/dashboard" element={<Dashboard uploadId={uploadId} />} />
          <Route path="/txn/:txnId" element={<TransactionDetails uploadId={uploadId} />} />
        </Routes>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200/60 py-4 text-center text-xs text-slate-400 glass">
        <p>⚡ Built with ❤️ for Ignite 8.0 Hackathon • AI-powered Audit Co-pilot</p>
      </footer>
    </div>
  );
}

export default App;