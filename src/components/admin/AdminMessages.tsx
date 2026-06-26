import { useState, useEffect } from 'react';
import { Mail, Loader2, Trash2 } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/contact-messages`, { headers: apiHeaders });
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(message: Message) {
    try {
      await fetch(`${ADMIN_API_URL}/contact-messages/${message.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ is_read: true }),
      });
      setMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, is_read: true } : m)
      );
    } catch (e) {
      console.error('Error marking as read');
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/contact-messages/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setMessages(prev => prev.filter(m => m.id !== id));
      setSelected(null);
    } catch (e) {
      console.error('Error deleting message');
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white">Messages de contact</h2>
        <p className="font-sans text-sm text-gray-500">
          {messages.filter(m => !m.is_read).length} non lu(s)
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-black-700 rounded-lg border border-black-600">
          <Mail size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500 font-sans">Aucun message</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => { setSelected(msg); if (!msg.is_read) markAsRead(msg); }}
              className={`bg-black-700 border border-black-600 rounded-lg p-4 cursor-pointer ${
                !msg.is_read ? 'border-l-4 border-l-gold' : ''
              } hover:border-gold/30 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-serif text-white">{msg.name}</span>
                    {!msg.is_read && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">Nouveau</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{msg.email}</span>
                    <span>{msg.subject}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="bg-black-700 border border-black-600 rounded-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-white">{selected.subject}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm"><span className="text-gray-500">De:</span> <span className="text-white">{selected.name}</span></p>
              <p className="text-sm"><span className="text-gray-500">Email:</span> <a href={`mailto:${selected.email}`} className="text-gold hover:underline">{selected.email}</a></p>
              {selected.phone && <p className="text-sm"><span className="text-gray-500">Téléphone:</span> <a href={`tel:${selected.phone}`} className="text-gold hover:underline">{selected.phone}</a></p>}
              <p className="text-sm"><span className="text-gray-500">Date:</span> {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-black-600 p-4 rounded">
              <p className="font-serif text-gray-300 whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-gold flex-1 text-center">
                Répondre par email
              </a>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="btn-outline-gold text-center">
                  Appeler
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
