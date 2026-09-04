import React, { useState } from 'react';

export default function SettingsPage() {
  // --- State for Profile ---
  const [profile, setProfile] = useState({
    fullName: 'Rahul Khanna',
    email: 'rahul.k@auditfirm.in',
    role: 'Senior Auditor',
    firm: 'Khanna & Associates CA',
    avatar: null,
  });

  // --- State for Notifications ---
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    inAppAlerts: true,
    criticalOnly: false,
  });

  // --- State for API Keys ---
  const [apiKey] = useState('ac_live_sk........4f2a');
  const [regenerating, setRegenerating] = useState(false);

  // --- State for AI Preferences ---
  const [aiPrefs, setAiPrefs] = useState({
    model: 'GPT-4o mini (Fast)',
    sensitivity: 50,
  });

  // --- State for Theme ---
  const [theme, setTheme] = useState('Light');

  // --- Handlers ---
  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleAvatarUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    alert('✅ Profile saved successfully!');
  };

  const handleRegenerateKey = () => {
    setRegenerating(true);
    setTimeout(() => {
      alert('🔑 New API key generated: ac_live_sk_new.......x9k3');
      setRegenerating(false);
    }, 1500);
  };

  const handleToggle = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  const getSensitivityLabel = (value) => {
    if (value <= 33) return 'Conservative';
    if (value <= 66) return 'Balanced';
    return 'Aggressive';
  };

  return (
    <div className="space-y-8">
      
      {/* ============================================================ */}
      {/* PAGE HEADER */}
      {/* ============================================================ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile, notifications, AI preferences, and integrations.</p>
      </div>

      {/* ============================================================ */}
      {/* PROFILE + NOTIFICATIONS (2-Column Grid) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- Profile Card --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile</h2>
          <p className="text-xs text-gray-400 -mt-2 mb-4">Your account information</p>
          
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  'RK'
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 cursor-pointer bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 transition">
                <span className="text-xs">📷</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[10px] text-gray-400 mt-2">Change Avatar</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleProfileChange('fullName', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => handleProfileChange('role', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Firm</label>
              <input
                type="text"
                value={profile.firm}
                onChange={(e) => handleProfileChange('firm', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Save Changes
          </button>
        </div>

        {/* --- Notifications Card --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Notifications</h2>
          <p className="text-xs text-gray-400 -mt-2 mb-4">Choose how you get alerted</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Alerts</p>
                <p className="text-xs text-gray-400">Receive critical anomaly alerts via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">In-App Alerts</p>
                <p className="text-xs text-gray-400">Show notifications in the app header</p>
              </div>
              <button
                onClick={() => handleToggle('inAppAlerts')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications.inAppAlerts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.inAppAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Critical Only</p>
                <p className="text-xs text-gray-400">Only notify for Critical risk transactions</p>
              </div>
              <button
                onClick={() => handleToggle('criticalOnly')}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications.criticalOnly ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications.criticalOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* API Keys Section (inside Notifications card) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">API Keys</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <p className="text-xs text-gray-400 -mt-1 mb-3">Integration credentials</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
              <code className="text-sm font-mono text-gray-600">{apiKey}</code>
              <button
                onClick={handleRegenerateKey}
                disabled={regenerating}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {regenerating ? '⏳ Generating...' : '🔄 Regenerate Key'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* AI PREFERENCES + THEME (2-Column Grid) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- AI Preferences Card --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">AI Preferences</h2>
          <p className="text-xs text-gray-400 -mt-2 mb-4">Configure the AI engine</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">LLM Model</label>
              <select
                value={aiPrefs.model}
                onChange={(e) => setAiPrefs({ ...aiPrefs, model: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option>GPT-4o mini (Fast)</option>
                <option>GPT-4o (Balanced)</option>
                <option>GPT-4 (High Accuracy)</option>
                <option>Llama 3 (Open Source)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">Anomaly Sensitivity</label>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">Conservative</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiPrefs.sensitivity}
                  onChange={(e) => setAiPrefs({ ...aiPrefs, sensitivity: parseInt(e.target.value) })}
                  className="w-3/5 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-gray-400">Aggressive</span>
              </div>
              <div className="text-center mt-1">
                <span className="text-xs font-medium text-blue-600">
                  {getSensitivityLabel(aiPrefs.sensitivity)} ({aiPrefs.sensitivity}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Theme Card --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Theme</h2>
          <p className="text-xs text-gray-400 -mt-2 mb-4">Switch between light, dark, and system themes</p>

          <div className="flex gap-3">
            {['Light', 'Dark', 'System'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  theme === t
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                RK
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Rahul Khanna</p>
                <p className="text-xs text-gray-400">Senior Auditor</p>
              </div>
              <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}