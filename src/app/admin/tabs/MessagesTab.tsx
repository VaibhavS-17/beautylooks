'use client';

import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, Clock, Reply, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ContactMessage } from '@/lib/types';
import toast from 'react-hot-toast';
import { updateMessageStatus } from '@/app/actions/contactActions';

export default function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load messages');
      console.error(error);
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id: string, status: 'unread' | 'read' | 'replied') => {
    const res = await updateMessageStatus(id, status);
    if (res.success) {
      toast.success('Status updated');
      fetchMessages();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } else {
      toast.error(res.error || 'Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-text-main mb-1">Messages</h2>
          <p className="text-sm text-text-muted">
            Manage contact form submissions ({unreadCount} unread)
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="p-2 border border-border rounded-xl text-text-muted hover:bg-black/5 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          {isLoading && messages.length === 0 ? (
            <div className="p-8 text-center text-text-muted">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Mail className="text-border mb-4" size={48} />
              <p className="text-text-muted">No messages found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-light/50">
                    <th className="p-4 font-semibold text-text-main">From</th>
                    <th className="p-4 font-semibold text-text-main">Subject</th>
                    <th className="p-4 font-semibold text-text-main">Status</th>
                    <th className="p-4 font-semibold text-text-main">Date</th>
                    <th className="p-4 font-semibold text-text-main">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={`border-b border-border hover:bg-brand-light/30 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-brand-light/50' : ''
                      } ${msg.status === 'unread' ? 'font-medium bg-blue-50/30' : ''}`}
                    >
                      <td className="p-4">
                        <div className="text-text-main">{msg.name}</div>
                        <div className="text-xs text-text-muted">{msg.email}</div>
                      </td>
                      <td className="p-4 max-w-[200px] truncate">{msg.subject}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            msg.status === 'unread'
                              ? 'bg-blue-100 text-blue-700'
                              : msg.status === 'read'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-text-muted">{formatDate(msg.created_at)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="p-1.5 text-text-muted hover:text-text-main hover:bg-black/5 rounded-md transition-colors"
                          title="View Message"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 h-fit sticky top-6">
          {selectedMessage ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-text-main mb-1">Message Details</h3>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'unread')}
                    disabled={selectedMessage.status === 'unread'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedMessage.status === 'unread'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed'
                        : 'border-border hover:bg-brand-light text-text-main'
                    }`}
                  >
                    <Clock size={14} /> Unread
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                    disabled={selectedMessage.status === 'read'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedMessage.status === 'read'
                        ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                        : 'border-border hover:bg-brand-light text-text-main'
                    }`}
                  >
                    <CheckCircle size={14} /> Read
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                    disabled={selectedMessage.status === 'replied'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedMessage.status === 'replied'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed'
                        : 'border-border hover:bg-brand-light text-text-main'
                    }`}
                  >
                    <Reply size={14} /> Replied
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">From</div>
                  <div className="font-medium text-text-main">{selectedMessage.name}</div>
                  <a href={`mailto:${selectedMessage.email}`} className="text-accent hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                
                {selectedMessage.phone && (
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Phone</div>
                    <a href={`tel:${selectedMessage.phone}`} className="text-accent hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Date</div>
                  <div className="text-text-main">{formatDate(selectedMessage.created_at)}</div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Subject</div>
                  <div className="font-medium text-text-main">{selectedMessage.subject}</div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Message</div>
                  <div className="p-4 bg-brand-light rounded-xl text-text-main whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Mail className="mx-auto mb-4 opacity-50" size={32} />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
