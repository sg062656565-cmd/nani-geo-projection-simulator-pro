
import React, { useState, useEffect, useRef } from 'react';
import { streamProjectionExplanation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ProjectionType, ChatMessage } from '../types';

interface AiTutorProps {
  currentProjection: ProjectionType;
}

const AiTutor: React.FC<AiTutorProps> = ({ currentProjection }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevProjection = useRef<ProjectionType>(currentProjection);

  const getSuggestions = (proj: ProjectionType) => {
    if (proj.includes('麥卡托')) return ["為什麼高緯度變那麼大？", "它是等角投影嗎？", "這對航海有什麼好處？"];
    if (proj.includes('心射')) return ["什麼是大圓線？", "為什麼看不到半個地球以上？"];
    if (proj.includes('莫爾威') || proj.includes('蘭伯特')) return ["「等積」是什麼意思？", "形狀為什麼會橢圓形？"];
    if (proj.includes('蓋爾-彼得斯')) return ["為什麼非洲變長了？", "與麥卡托有什麼不同？"];
    if (proj.includes('正弦')) return ["這為什麼叫正弦投影？", "中央經線有變形嗎？"];
    if (proj.includes('羅賓森')) return ["什麼是「折衷」投影？", "為什麼課本常用這種地圖？", "它是如何平衡變形的？"];
    if (proj.includes('正射')) return ["這是在外太空看的樣子嗎？", "哪些部分縮放最嚴重？"];
    return ["這有什麼優點？", "在哪裡最準確？", "適合畫什麼樣的地圖？"];
  };

  const currentSuggestions = getSuggestions(currentProjection);

  useEffect(() => {
    if (prevProjection.current !== currentProjection || messages.length === 0) {
      handleSend(null); 
      prevProjection.current = currentProjection;
    }
  }, [currentProjection]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (forcedInput?: string | null) => {
    const textToSend = forcedInput === undefined ? input : forcedInput;
    if (textToSend === "" && textToSend !== null) return;
    if (isTyping) return;

    if (textToSend !== null) {
      setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    }
    
    setInput('');
    setIsTyping(true);

    const botMsg: ChatMessage = { role: 'model', text: '', isLoading: true };
    setMessages(prev => [...prev, botMsg]);

    let fullResponse = '';
    await streamProjectionExplanation(currentProjection, textToSend, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.role === 'model') {
                lastMsg.text = fullResponse;
                lastMsg.isLoading = false;
            }
            return newMsgs;
        });
    });
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                <span className="text-lg">👨‍🏫</span>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">Professor AI</h3>
                <p className="text-[10px] text-indigo-400 font-mono">GEOGRAPHY TUTOR</p>
            </div>
        </div>
        <div className="flex gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}
            >
              {msg.isLoading && msg.text === '' ? (
                 <div className="flex items-center gap-1 py-1">
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                 </div>
              ) : (
                <div className="prose prose-invert prose-xs">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!isTyping && (
        <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/50 bg-slate-950/30">
            {currentSuggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => handleSend(s)}
                    className="shrink-0 text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>
      )}

      <div className="p-3 bg-slate-950/80 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="詢問地理老師..."
            className="flex-1 bg-slate-800/50 text-white text-xs rounded-lg border border-slate-700 px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white p-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiTutor;
