import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Upload({ setUploadId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setFileName(file.name);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(30);
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setProgress(Math.round((p.loaded / p.total) * 100)),
      });
      
      const id = response.data.upload_id;
      setUploadId(id);
      setProgress(100);

      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please check the file format.');
      setUploading(false);
    }
  }, [setUploadId, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
          Upload <span className="text-gradient">Financial Data</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Drop your General Ledger or Transaction CSV here. AI analyzes it instantly.</p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 
          ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 shadow-inner scale-[1.01]' : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50/50'}
          ${uploading ? 'opacity-80 pointer-events-none' : ''}
          glass`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto animate-pulse">
              <span className="text-3xl">⏳</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Analyzing {fileName}</p>
              <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-3 mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-2">{progress}% • Scanning for anomalies</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mx-auto animate-float">
              <span className="text-4xl">📁</span>
            </div>
            <p className="text-xl font-medium text-slate-700">
              {isDragActive ? 'Drop it right here!' : 'Drag & drop your CSV/Excel file'}
            </p>
            <p className="text-sm text-slate-400">or click to browse files</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-400">
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">.CSV</span>
              <span className="px-3 py-1 bg-white rounded-full border border-slate-200">.XLSX</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start space-x-3 animate-fade-in-up">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">Upload Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="glass p-6 rounded-xl card-hover">
          <span className="text-3xl block mb-2">🧠</span>
          <p className="font-semibold text-slate-700">Hybrid AI</p>
          <p className="text-sm text-slate-500">Rules + XGBoost detection</p>
        </div>
        <div className="glass p-6 rounded-xl card-hover">
          <span className="text-3xl block mb-2">🎯</span>
          <p className="font-semibold text-slate-700">6 Anomaly Types</p>
          <p className="text-sm text-slate-500">Duplicates, GST, Backdate & more</p>
        </div>
        <div className="glass p-6 rounded-xl card-hover">
          <span className="text-3xl block mb-2">📄</span>
          <p className="font-semibold text-slate-700">Audit Reports</p>
          <p className="text-sm text-slate-500">One-click professional export</p>
        </div>
      </div>
    </div>
  );
}

export default Upload;