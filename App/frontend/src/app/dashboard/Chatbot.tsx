"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isThinking?: boolean;
}

const API_BASE = "http://localhost:8000";

const IC: Record<string, ReactNode> = {
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  bot: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" /><line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" /><line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" /></svg>,
  sparkles: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3m0 12v3M5.31 5.31l2.12 2.12m9.14 9.14l2.12 2.12M3 12h3m12 0h3M5.31 18.69l2.12-2.12m9.14-9.14l2.12-2.12" /></svg>,
};

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hello Krish. I am Trinetra AI. How can I assist with your drone operations today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const parseContent = (text: string) => {
    // Basic Markdown/Pointer parser
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      let processed = line;

      // Bold handling: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(processed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processed.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`${i}-${match.index}`}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(processed.substring(lastIndex));

      // Pointer handling: -, *, or number
      const isPointer = /^[*-]\s/.test(line) || /^\d+\.\s/.test(line);

      return (
        <div key={i} style={{
          marginBottom: line.trim() === "" ? "12px" : "4px",
          paddingLeft: isPointer ? "16px" : "0",
          position: "relative"
        }}>
          {isPointer && <span style={{ position: "absolute", left: 0 }}>•</span>}
          {parts}
        </div>
      );
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsgContent = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userMsgContent };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // 1. Thinking state
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: thinkingId, role: "assistant", content: "", isThinking: true }]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgContent, session_id: sessionId }),
      });
      
      if (!res.ok) throw new Error("API issues");
      
      const data = await res.json();
      setSessionId(data.session_id);

      // 2. Remove thinking, start streaming replacement
      setMessages(prev => prev.filter(m => m.id !== thinkingId));

      const responseText = data.answer || "No response received";
      const words = responseText.split(" ");
      let currentText = "";

      // Create new message for streaming
      const aiMsgId = (Date.now() + 2).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: currentText } : m));
        // Sequential simulation for buttery smooth feel
        await new Promise(r => setTimeout(r, 15 + Math.random() * 20)); 
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== thinkingId));
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: "Error: Could not connect to Trinetra AI Core. Please ensure the backend and Ollama are running." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="chat-page">
      <style>{`
        .chat-page {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #ece9e4;
          font-family: 'DM Sans', sans-serif;
        }

        .chat-header {
          padding: 24px 32px;
          border-bottom: 1px solid #e2dfd9;
          background: #f5f3ef;
        }
        .chat-h-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          font-weight: 400;
          color: #1a1a1a;
        }
        .chat-h-status {
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .chat-feed {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .chat-feed::-webkit-scrollbar { width: 4px; }
        .chat-feed::-webkit-scrollbar-thumb { background: #d8d4ce; border-radius: 10px; }

        .msg-wrap {
          display: flex;
          gap: 16px;
          max-width: 80%;
          animation: fadeUp 0.3s ease both;
        }
        .msg-wrap.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .msg-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #1a1a1a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msg-wrap.user .msg-icon {
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #e2dfd9;
        }

        .msg-box {
          background: #fff;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid #e2dfd9;
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .msg-wrap.user .msg-box {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }

        /* ── Thinking State ── */
        .thinking {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(26,26,26,0.04);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6b6560;
        }
        .think-dots { display: flex; gap: 4px; }
        .think-dot {
          width: 4px;
          height: 4px;
          background: #1a1a1a;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .think-dot:nth-child(2) { animation-delay: 0.2s; }
        .think-dot:nth-child(3) { animation-delay: 0.4s; }

        .chat-input-area {
          padding: 24px 32px 32px;
          background: #ece9e4;
        }
        .chat-input-container {
          background: #fff;
          border: 1px solid #e2dfd9;
          border-radius: 16px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }
        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 10px 4px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          color: #1a1a1a;
        }
        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .chat-send-btn:hover { background: #333; transform: scale(1.05); }
        .chat-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="chat-header">
        <h1 className="chat-h-title">Trinetra Intelligence</h1>
        <div className="chat-h-status">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          AI Core Online
        </div>
      </div>

      <div className="chat-feed" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`msg-wrap ${m.role}`}>
            <div className="msg-icon">
              {m.role === "assistant" ? IC.bot : "KR"}
            </div>
            {m.isThinking ? (
              <div className="thinking">
                {IC.sparkles} Trinetra is thinking
                <div className="think-dots">
                  <div className="think-dot" />
                  <div className="think-dot" />
                  <div className="think-dot" />
                </div>
              </div>
            ) : (
              <div className="msg-box">
                {parseContent(m.content)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-container">
          <input
            className="chat-input"
            placeholder="Ask Trinetra to analyze mission data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            {IC.send}
          </button>
        </div>
      </div>
    </div>
  );
}
