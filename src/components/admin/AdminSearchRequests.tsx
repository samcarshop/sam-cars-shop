import { useState, useEffect } from 'react';
import { Search, Loader2, Trash2, Phone, Mail } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface SearchRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  brand: string;
  model: string;
  budget: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminSearchRequests() {
  const [requests, setRequests] = useState<SearchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SearchRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/search-requests`, { headers: apiHeaders });
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      console.error('Error loading requests');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`${ADMIN_API_URL}/search-requests/${id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ status }),
      });
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
    } catch (e) {
      console.error('Error updating status');
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm('Supprimer cette recherche ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/search-requests/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelected(null);
    } catch (e) {
      console.error('Error deleting request');
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="font-serif text-2xl text-white mb-6">Demandes de recherche</h2>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-black-700 rounded-lg border border-black-600">
          <Search size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500 font-sans">Aucune demande</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(req => (
            <div
              key={req.id}
              onClick={() => setSelected(req)}
              className="bg-black-700 border border-black-600 rounded-lg p-4 cursor-pointer hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-serif text-white">{req.brand} {req.model}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[req.status]}`}>
                      {statusLabels[req.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{req.name}</span>
                    <span>{req.budget}</span>
                    <span>{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteRequest(req.id); }}
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
              <h3 className="font-serif text-lg text-white">{selected.brand} {selected.model}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">×</button>
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-sm"><span className="text-gray-500">Client:</span> <span className="text-white">{selected.name}</span></p>
              {selected.email && <p className="text-sm"><span className="text-gray-500">Email:</span> <a href={`mailto:${selected.email}`} className="text-gold hover:underline">{selected.email}</a></p>}
              {selected.phone && <p className="text-sm"><span className="text-gray-500">Téléphone:</span> <a href={`tel:${selected.phone}`} className="text-gold hover:underline">{selected.phone}</a></p>}
              <p className="text-sm"><span className="text-gray-500">Budget:</span> <span className="text-white">{selected.budget}</span></p>
            </div>

            {selected.message && (
              <div className="bg-black-600 p-4 rounded mb-4">
                <p className="font-serif text-gray-300 whitespace-pre-wrap">{selected.message}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Statut</label>
              <div className="flex gap-2">
                {Object.entries(statusLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selected.id, key)}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      selected.status === key
                        ? statusColors[key]
                        : 'bg-black-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {selected.email && (
                <a href={`mailto:${selected.email}?subject=Re: Recherche ${selected.brand} ${selected.model}`} className="btn-gold flex-1 text-center flex items-center justify-center gap-2">
                  <Mail size={14} /> Email
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="btn-outline-gold flex items-center justify-center gap-2">
                  <Phone size={14} /> Appeler
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
