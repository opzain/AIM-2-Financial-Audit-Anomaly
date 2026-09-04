import React, { useState } from 'react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '01-04-2026', end: '31-08-2026' });
  const [logoFile, setLogoFile] = useState(null);
  const [selectedFields, setSelectedFields] = useState({
    transactionId: true,
    vendor: true,
    amount: true,
    gstDetails: true,
    riskScore: true,
    aiMemo: false,
    timeline: false,
    flags: false,
    tags: false,
    internalNotes: false,
  });

  // --- Download History Mock Data ---
  const downloadHistory = [
    { name: 'Executive Summary — Q1 F...', date: '30 Aug, 11:32 pm', size: '1.2 MB', range: '01-Apr to 30-Jun' },
    { name: 'Anomaly Report — August', date: '29 Aug, 06:00 pm', size: '3.4 MB', range: '01-Aug to 29-Aug' },
    { name: 'Detailed Ledger — AP', date: '28 Aug, 02:42 pm', size: '820 KB', range: '01-Aug to 28-Aug' },
    { name: 'AI Audit Memo Bundle', date: '27 Aug, 09:15 pm', size: '2.8 MB', range: '01-Aug to 27-Aug' },
  ];

  // --- Template Data ---
  const templates = [
    {
      title: 'Executive Summary',
      description: 'High-level overview for partners & stakeholders',
      format: 'PDF',
      icon: '📊'
    },
    {
      title: 'Anomaly Report',
      description: 'Detailed breakdown of all flagged transactions',
      format: 'PDF',
      icon: '🔍'
    },
    {
      title: 'AI Audit Memo Bundle',
      description: 'AI-generated memos with structured JSON data',
      format: 'PDF+JSON',
      icon: '🧠'
    },
  ];

  // --- Handlers ---
  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0].name);
    }
  };

  const handleGenerateReport = () => {
    alert('✅ Report generation started! This would download a PDF with your selected options.');
  };

  const handleDownload = (reportName) => {
    alert(`📥 Downloading: ${reportName}`);
  };

  return (
    <div className="space-y-8">
      
      {/* ============================================================ */}
      {/* PAGE HEADER */}
      {/* ============================================================ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm">Generate professional, audit-ready reports with custom fields and branding.</p>
      </div>

      {/* ============================================================ */}
      {/* REPORT TEMPLATES (3 Cards) */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl mb-2">{template.icon}</p>
                  <h3 className="font-semibold text-gray-800">{template.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {template.format}
                </span>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => handleDownload(template.title)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  📥 Download History
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CUSTOMIZATION SECTION */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Customization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Date Range + Logo */}
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Date Range</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="text"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">
                  📅
                </button>
              </div>
            </div>

            {/* Company Logo Upload */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Company Logo</p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoFile && (
                  <span className="text-sm text-emerald-600">✅ {logoFile}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Include Fields (Checkboxes) */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Include Fields</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(selectedFields).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleFieldToggle(key)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleGenerateReport}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            📄 Generate Report
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DOWNLOAD HISTORY */}
      {/* ============================================================ */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Download History</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Range</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {downloadHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.range}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDownload(item.name)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full transition-all"
                    >
                      Download
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