import React, { useState, useRef, useEffect } from 'react';
import {
  AeroSenseAIAgent,
} from '@/genai/orchestrator';
import {
  AirQualitySnapshot,
  ChatMessage,
  FamilyProfile,
} from '@/types';
import { sanitizeInput } from '@/core/security';
import {
  Send,
  Bot,
  User,
  Wrench,
  BookOpen,
} from 'lucide-react';

interface ChatAssistantProps {
  profile: FamilyProfile;
  snapshot: AirQualitySnapshot;
  language: 'en' | 'hi';
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ profile, snapshot, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      role: 'assistant',
      content:
        `### 👋 Hello! I am your AeroSense AI Assistant.\n\n` +
        `I am actively analyzing the severe winter smog conditions in **${profile.locationName}** (AQI: ${snapshot.aqi}, PM2.5: ${snapshot.pm25} µg/m³).\n\n` +
        `I can help you build **scientific DIY filters**, pinpoint your **optimal 20-min solar ventilation window**, protect high-risk family members, and calculate your **avoided particulate dose**. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agent] = useState(() => new AeroSenseAIAgent());
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const quickQuestions = [
    'How do I build a DIY Corsi-Rosenthal filter under $75?',
    'Is it safe for my child with asthma to play outside today?',
    'When should I open windows for ventilation?',
    'What is our direct lung & CO2 impact today?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const rawText = queryText || inputValue;
    const textToSend = sanitizeInput(rawText.trim(), 500);
    if (!textToSend || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputValue('');
    setIsProcessing(true);

    try {
      // Execute multi-tool GenAI agent
      const assistantResponse = await agent.respondToUserQuery(textToSend, profile, snapshot);
      setMessages((prev) => [...prev, assistantResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: language === 'hi'
            ? 'क्षमा करें, AI सहायक से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered a temporary tool execution delay. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[700px] overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                AeroSense GenAI Copilot
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Multi-Tool Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded in EPA, WHO 2021 Guidelines & UC Davis Aerosol Research
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${
                msg.role === 'user'
                  ? 'bg-sky-600'
                  : 'bg-gradient-to-tr from-indigo-600 to-sky-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line prose dark:prose-invert max-w-none">
                {msg.content}
              </div>

              {/* Tool Execution Inspector (if assistant performed autonomous tool calls) */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-sky-500" /> Autonomous Tool Execution Verified:
                  </span>
                  {msg.toolCalls.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono"
                    >
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{tool.toolName}()</span>
                      <span className="text-slate-400 ml-2">✓ Executed</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Scientific Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-400" /> Grounded Citations:
                  </span>
                  {msg.citations.map((cite, idx) => (
                    <p key={idx} className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      • {cite.source}: "{cite.keyTakeaway}"
                    </p>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] mt-2 font-medium ${
                  msg.role === 'user' ? 'text-sky-200 text-right' : 'text-slate-400 text-left'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3 text-slate-400 text-xs italic">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 text-sky-500" />
            </div>
            <span>AeroSense AI is executing atmospheric models and synthesizing recommendations...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Try asking:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap hover:border-sky-500 hover:text-sky-600 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about smog forecasts, Corsi-Rosenthal boxes, child protection..."
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

    </div>
  );
};

