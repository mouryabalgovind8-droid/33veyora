import React, { useState } from 'react';
import { Mail, CheckCircle2, User, ShieldCheck, RefreshCw, Send, Eye, FileText } from 'lucide-react';
import { EmailNotification } from '../types';

interface EmailNotificationCenterProps {
  notifications: EmailNotification[];
  onRefresh: () => void;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  notifications,
  onRefresh,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(
    notifications[0] || null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Automated Email Notification Hub</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live audit of automated HTML confirmation emails, invoices, and host booking alerts triggered across the platform.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all self-start shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Email Queue</span>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List Left */}
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sent Messages ({notifications.length})
            </h3>

            {notifications.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                No automated emails triggered yet. Complete a booking to see live emails!
              </div>
            ) : (
              notifications.map((notif) => {
                const isSelected = selectedNotification?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotification(notif)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                          notif.recipientRole === 'guest'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {notif.recipientRole === 'guest' ? 'Guest Copy' : 'Host Alert'}
                      </span>
                      <span className="text-slate-400">{new Date(notif.sentAt).toLocaleTimeString()}</span>
                    </div>

                    <h4 className="font-bold text-xs line-clamp-1 text-slate-900">{notif.subject}</h4>
                    <p className="text-[11px] text-slate-500 truncate">To: {notif.recipientEmail}</p>

                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold pt-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Status: {notif.status.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rendered Email Preview Right */}
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[500px] flex flex-col">
            {selectedNotification ? (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Header Info */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl text-xs space-y-1.5 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>
                      <strong className="text-slate-800">Subject:</strong> {selectedNotification.subject}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      HTML Rendered
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <strong>To:</strong> {selectedNotification.recipientName} ({selectedNotification.recipientEmail})
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    <strong>Sent Time:</strong> {new Date(selectedNotification.sentAt).toLocaleString()}
                  </div>
                </div>

                {/* HTML Body Box */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto shadow-sm">
                  <div
                    className="prose prose-slate max-w-none text-xs text-slate-800"
                    dangerouslySetInnerHTML={{ __html: selectedNotification.htmlBody }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
                <Mail className="h-10 w-10 text-slate-300 mb-2" />
                <p>Select an automated email notification from the left list to view rendered HTML output.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
