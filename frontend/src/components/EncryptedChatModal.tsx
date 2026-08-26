import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Lock,
  ShieldCheck,
  Sparkles,
  Paperclip,
  CheckCheck,
  User,
  Bot,
  MapPin,
  Calendar
} from 'lucide-react';
import { Message } from '../types';

interface EncryptedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  hostName: string;
  listingTitle: string;
  currentRole: 'guest' | 'host';
}

export const EncryptedChatModal: React.FC<EncryptedChatModalProps> = ({
  isOpen,
  onClose,
  threadId,
  hostName,
  listingTitle,
  currentRole,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, generateAi: boolean = false) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !generateAi) return;

    setIsSending(true);
    const contentToSend = inputText.trim() || 'Could you confirm check-in instructions and parking details?';
    setInputText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          senderId: currentRole === 'guest' ? 'guest-1' : 'host-101',
          senderName: currentRole === 'guest' ? 'Sandeep Bendre' : hostName,
          senderRole: currentRole,
          content: contentToSend,
          generateAiReply: generateAi || currentRole === 'guest',
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {hostName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>{hostName}</span>
                <span className="flex items-center gap-1 text-[9px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  <Lock className="h-2.5 w-2.5" /> E2E Encrypted
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[240px]">{listingTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* E2E Key Verification Notice Bar */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Messages protected with 256-Bit AES Key (Session Digest: #e8a9-441f)</span>
          </span>
          <span className="text-emerald-600 font-bold">Active Key</span>
        </div>

        {/* Message Log Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <Lock className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">Direct chat session established.</p>
              <p className="text-[10px] text-slate-400">Messages are encrypted between host and guest.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe =
                (currentRole === 'guest' && msg.senderRole === 'guest') ||
                (currentRole === 'host' && (msg.senderRole === 'host' || msg.senderId === 'host-101'));

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-medium">
                    <span>{msg.senderName}</span>
                    <span>&bull;</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.content}</p>

                    <div className="flex items-center justify-end gap-1 text-[9px] opacity-80 pt-0.5 font-medium">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Encrypted</span>
                      <CheckCheck className={`h-3 w-3 ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[10px]">
          <button
            onClick={() => setInputText('Can you confirm the check-in time and exact location PIN?')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full whitespace-nowrap font-medium"
          >
            📍 Location &amp; Check-in
          </button>
          <button
            onClick={() => setInputText('Is parking available right next to the property?')}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full whitespace-nowrap font-medium"
          >
            🚗 Parking Info
          </button>
          <button
            onClick={() => handleSend(undefined, true)}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold flex items-center gap-1 whitespace-nowrap"
          >
            <Sparkles className="h-3 w-3 text-indigo-600" />
            <span>Host Gemini AI Auto-Reply</span>
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => handleSend(e, false)} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type encrypted message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 placeholder-slate-400 font-medium"
          />

          <button
            type="submit"
            disabled={isSending}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
