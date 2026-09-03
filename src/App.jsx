import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import TransactionDetail from './components/TransactionDetail';

function App() {
  const [uploadId, setUploadId] = useState(null);

  return (
    <BrowserRouter>
      <nav className="bg-slate-900 text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <h1 className="text-xl font-bold tracking-tight">AuditCopilot</h1>
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full ml-2">AI</span>
        </div>
        <div className="space-x-4 text-sm">
          <Link to="/" className="hover:text-blue-300 transition">Upload</Link>
          {uploadId && (
            <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Upload setUploadId={setUploadId} />} />
          <Route path="/dashboard" element={<Dashboard uploadId={uploadId} />} />
          <Route path="/txn/:id" element={<TransactionDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;