import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import AIChatBubble from './AIChatBubble';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Math.random().toString(36).substring(2, 9)}`);
  
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your **AssetFlow AI Co-Pilot**. I have real-time access to our enterprise assets, maintenance Kanban queue, conference room bookings, and reliability telemetry.\n\nHow can I assist your workflow today?",
      timestamp: new Date().toISOString()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customQuery) => {
    const queryText = typeof customQuery === 'string' ? customQuery : input;
    if (!queryText.trim() || loading) return;

    const userTurn = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userTurn]);
    if (typeof customQuery !== 'string') setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendChatMessage(queryText.trim(), {}, sessionId);
      const aiTurn = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response ? response.reply : "I encountered a minor connection delay. Please rephrase your query.",
        actionTaken: response?.actionTaken || null,
        timestamp: response?.timestamp || new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiTurn]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I am currently running in offline diagnostic mode. Let me know if you would like to inspect local asset registers or raise a maintenance ticket directly.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation history cleared. I am ready for your next question or command!",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const suggestions = [
    "How many assets under maintenance?",
    "Show laptops in Bengaluru",
    "Check organizational anomalies",
    "Raise maintenance for AF-0114"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Expanded Chat Window Panel */}
      {isOpen && (
        <div className="mb-4 w-[90vw] max-w-[420px] h-[540px] bg-white border border-border-color rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="bg-[#FFFDFB] border-b border-border-color p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-orange-light text-primary-orange flex items-center justify-center text-xl font-bold shadow-xs">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-extrabold text-text-primary leading-none">
                    AssetFlow AI Co-Pilot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online & Connected" />
                </div>
                <span className="text-[10px] font-bold text-text-secondary">
                  Natural Language Enterprise Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[11px] font-extrabold text-text-secondary hover:text-primary-orange px-2 py-1 rounded-lg hover:bg-bg-gray transition cursor-pointer"
                title="Clear chat turns"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-bg-gray hover:bg-gray-200 text-text-secondary hover:text-text-primary flex items-center justify-center text-lg font-bold transition cursor-pointer"
                title="Minimize chat window"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#FAFAFA]">
            {messages.map((msg) => (
              <AIChatBubble key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex items-center gap-2.5 p-3 bg-bg-gray rounded-2xl w-fit animate-pulse">
                <div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-text-secondary">
                  AI Co-Pilot querying live system telemetry...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2.5 bg-white border-t border-border-color/60 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="shrink-0 bg-bg-gray hover:bg-primary-orange-light hover:text-primary-orange text-text-secondary text-[11px] font-bold px-3 py-1.5 rounded-full border border-border-color transition cursor-pointer disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Footer Area */}
          <div className="p-3 bg-white border-t border-border-color flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about assets, bookings, or tickets..."
              className="flex-1 border border-border-color rounded-2xl px-4 py-2.5 bg-bg-gray/50 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary-orange focus:bg-white placeholder:text-text-muted transition"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-primary-orange hover:bg-primary-orange-hover disabled:opacity-40 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition cursor-pointer shrink-0"
              title="Send message"
            >
              ➤
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary-orange hover:bg-primary-orange-hover text-white text-2xl shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-white"
        title={isOpen ? "Minimize AI Co-Pilot" : "Open AssetFlow AI Co-Pilot"}
      >
        <span>🤖</span>
      </button>

    </div>
  );
}
