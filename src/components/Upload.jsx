import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../api';

function Upload({ setUploadId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile(formData);
      const id = response.data.upload_id;
      setUploadId(id);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Check CSV format.');
      setLoading(false);
    }
  }, [setUploadId, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xlsx'] },
    maxFiles: 1,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">📊 Upload Financial Data</h2>
        <p className="text-slate-500 mt-1">Drop your General Ledger or Transaction CSV here.</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-white'}
          ${loading ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div>
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-lg font-medium text-slate-700">Uploading & Analyzing...</p>
            <div className="w-48 h-2 bg-slate-200 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📁</div>
            <p className="text-lg font-medium text-slate-700">
              {isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-sm text-slate-400 mt-2">Supports .CSV, .XLSX</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-2xl block">🧠</span>
          <p className="font-semibold">AI-Powered</p>
          <p className="text-slate-500">Hybrid Rules + ML</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-2xl block">🎯</span>
          <p className="font-semibold">6 Anomaly Types</p>
          <p className="text-slate-500">Duplicates, GST, Backdate</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <span className="text-2xl block">📄</span>
          <p className="font-semibold">Audit Reports</p>
          <p className="text-slate-500">One-click export</p>
        </div>
      </div>
    </div>
  );
}

export default Upload;