import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AiInsightsPage({ uploadId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [topTxn, setTopTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // --- Fetch top transaction for context ---
  useEffect(() => {
    if (!uploadId) {
      setLoading(false);
      return;
    }
    fetch(`/api/dashboard/${uploadId}`)
      .then(res => res.json())
      .then(data => {
        if (data.top_transactions && data.top_transactions.length > 0) {
          setTopTxn(data.top_transactions[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [uploadId]);

  // --- Auto-scroll to bottom of chat ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Add initial AI welcome message ---
  useEffect(() => {
    if (!loading) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Hello! I'm your AI audit assistant. I've analyzed your current ledger and identified several high-risk transactions. You can ask me to summarize a transaction, recommend audit procedures, check for fraud patterns, or generate an audit memo. How can I help?`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [loading]);

  // --- Generate AI response based on context ---
  const generateAIResponse = (query, transaction) => {
    if (!transaction) {
      return "I don't have a transaction selected. Please upload a file and analyze it first.";
    }

    const txnId = transaction.txn_id || 'TXN-10028';
    const vendor = transaction.vendor || 'Unknown Vendor';
    const amount = transaction.amount?.toLocaleString() || '0';
    const evidence = transaction.evidence || 'No specific flags detected.';
    const riskLevel = transaction.risk_level || 'Medium';
    const riskScore = transaction.risk_score || 0;

    const lowerQuery = query.toLowerCase();

    // --- Summarize this transaction ---
    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
      return `📋 **Transaction Summary: ${txnId}**\n\n` +
             `• **Vendor:** ${vendor}\n` +
             `• **Amount:** ₹${amount}\n` +
             `• **Risk Level:** ${riskLevel} (Score: ${riskScore})\n` +
             `• **Evidence:** ${evidence}\n\n` +
             `This transaction was flagged for the following reasons: ${evidence || 'No specific flags detected. Please review manually.'}`;
    }

    // --- What audit procedures should I follow? ---
    if (lowerQuery.includes('procedure') || lowerQuery.includes('audit') && lowerQuery.includes('follow')) {
      return `🔍 **Recommended Audit Procedures for ${txnId}:**\n\n` +
             `1. **Vendor Confirmation:** Send a confirmation request to ${vendor} to verify the invoice details.\n` +
             `2. **Source Document Inspection:** Obtain the original purchase order, goods received note, and invoice.\n` +
             `3. **GST Reconciliation:** Cross-check GST amount with GSTR-2A/2B returns.\n` +
             `4. **Substantive Testing:** Perform cut-off testing and verify the transaction date.\n` +
             `5. **Bank Reconciliation:** Match the payment with bank statement entries.\n\n` +
             `Based on the ${riskLevel} risk rating, prioritize this transaction for immediate review.`;
    }

    // --- Check for potential fraud patterns ---
    if (lowerQuery.includes('fraud') || lowerQuery.includes('pattern')) {
      return `🚨 **Fraud Pattern Analysis for ${txnId}:**\n\n` +
             `**Risk Indicators Detected:**\n` +
             `${evidence || 'No specific fraud patterns detected.'}\n\n` +
             `**Suggested Next Steps:**\n` +
             `• Verify the vendor's legitimacy (check GSTIN, PAN, and address).\n` +
             `• Analyze historical transactions with this vendor for anomalies.\n` +
             `• Check for round-tripping or circular transactions.\n` +
             `• Review approval workflows for this transaction.\n\n` +
             `⚠️ The ${riskLevel} risk level warrants immediate investigation.`;
    }

    // --- Generate an audit memo ---
    if (lowerQuery.includes('memo') || lowerQuery.includes('generate') && lowerQuery.includes('memo')) {
      return `📄 **AI-Generated Audit Memo**\n\n` +
             `**To:** Audit Partner\n` +
             `**From:** AI Audit Assistant\n` +
             `**Date:** ${new Date().toLocaleDateString()}\n` +
             `**Subject:** ${riskLevel} Risk Flagged in ${txnId} – ${vendor}\n\n` +
             `During our audit procedures, the following transaction was identified with ${riskLevel} risk:\n\n` +
             `• **Transaction ID:** ${txnId}\n` +
             `• **Vendor:** ${vendor}\n` +
             `• **Amount:** ₹${amount}\n` +
             `• **Risk Score:** ${riskScore}/100\n\n` +
             `**Evidence:** ${evidence}\n\n` +
             `**Recommendation:** Obtain vendor confirmation, inspect underlying source documents, and perform substantive testing on the ${evidence || 'flagged'} components.\n\n` +
             `This memo was generated by AI and should be reviewed by a qualified professional.`;
    }

    // --- Default: Helpful response ---
    return `🤖 I understand you're asking about **${txnId}** (${vendor}, ₹${amount}).\n\n` +
           `You can ask me to:\n` +
           `• "Summarize this transaction"\n` +
           `• "What audit procedures should I follow?"\n` +
           `• "Check for potential fraud patterns"\n` +
           `• "Generate an audit memo"\n\n` +
           `Or ask a custom question about this transaction.`;
  };

  // --- Handle sending a message ---
  const handleSend = (customQuery = null) => {
    const query = customQuery || input.trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI typing
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(query, topTxn);
      const aiMsg = {
        id: messages.length + 2,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // --- Suggested Prompts ---
  const suggestedPrompts = [
    { label: 'Summarize this transaction', action: () => handleSend('Summarize this transaction') },
    { label: 'What audit procedures should I follow?', action: () => handleSend('What audit procedures should I follow?') },
    { label: 'Check for potential fraud patterns', action: () => handleSend('Check for potential fraud patterns') },
    { label: 'Generate an audit memo', action: () => handleSend('Generate an audit memo') },
  ];

  // --- Handle Enter key ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  // --- No Data State ---
  if (!topTxn) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🧠</p>
        <p className="text-gray-500 text-lg">No transaction data found. Upload a file first.</p>
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
      
      {/* ============================================================ */}
      {/* PAGE HEADER */}
      {/* ============================================================ */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-500 text-sm">Chat with the AI assistant to investigate anomalies and generate audit memos.</p>
      </div>

      {/* ============================================================ */}
      {/* MAIN CHAT LAYOUT (2 Columns) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        
        {/* --- LEFT: Context Panel (1/4) --- */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Context</h3>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Top Risk Transaction</p>
            
            <p className="text-lg font-bold text-gray-800 font-mono mt-2">{topTxn.txn_id}</p>
            <p className="text-sm font-medium text-gray-700">{topTxn.vendor}</p>
            <p className="text-sm text-gray-600">
              ₹{topTxn.amount?.toLocaleString()} · {topTxn.date ? new Date(topTxn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                topTxn.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                topTxn.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {topTxn.risk_level || 'Medium'}
              </span>
              <span className="text-xs font-medium text-gray-500">Score {topTxn.risk_score || 0}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-indigo-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detected Flags</p>
              <p className="text-sm text-gray-700">{topTxn.evidence || 'No specific flags'}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-indigo-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {topTxn.risk_level === 'Critical' || topTxn.risk_level === 'High' ? (
                  <>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">High-Risk Vendor</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full">Single Flag</span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">Normal</span>
                )}
                {topTxn.anomaly_types && topTxn.anomaly_types.split(',').map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            <p>💡 Ask the AI assistant about this transaction.</p>
          </div>
        </div>

        {/* --- RIGHT: Chat Interface (3/4) --- */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <div className={`text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'text-white' : 'text-gray-700'}`}>
                    {msg.text}
                  </div>
                  <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-2 border-t border-gray-100 flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={prompt.action}
                disabled={isTyping}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors disabled:opacity-50"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a transaction, request an audit procedure, or generate a memo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}