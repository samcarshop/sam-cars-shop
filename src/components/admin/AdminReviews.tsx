import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, Eye, EyeOff, Loader2, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  vehicle?: string;
  date: string;
  is_visible: boolean;
  sort_order: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/reviews`, { headers: apiHeaders });
      const data = await res.json();
      setReviews(data);
    } catch (e) {
      console.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  }

  async function saveReview() {
    if (!editing) return;
    setSaving(true);
    try {
      const url = editing.id && editing.id !== 'new'
        ? `${ADMIN_API_URL}/reviews/${editing.id}`
        : `${ADMIN_API_URL}/reviews`;
      const method = editing.id && editing.id !== 'new' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editing.id === 'new') {
          setReviews(prev => [...prev, saved]);
        } else {
          setReviews(prev => prev.map(r => r.id === saved.id ? saved : r));
        }
        setEditing(null);
      }
    } catch (e) {
      console.error('Error saving review');
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Supprimer cet avis ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Error deleting review');
    }
  }

  async function toggleVisibility(review: Review) {
    try {
      const res = await fetch(`${ADMIN_API_URL}/reviews/${review.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ is_visible: !review.is_visible }),
      });
      if (res.ok) {
        setReviews(prev =>
          prev.map(r => r.id === review.id ? { ...r, is_visible: !r.is_visible } : r)
        );
      }
    } catch (e) {
      console.error('Error toggling visibility');
    }
  }

  function moveReview(id: string, direction: 'up' | 'down') {
    const idx = reviews.findIndex(r => r.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === reviews.length - 1)) return;

    const newReviews = [...reviews];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newReviews[idx], newReviews[swapIdx]] = [newReviews[swapIdx], newReviews[idx]];
    setReviews(newReviews.map((r, i) => ({ ...r, sort_order: i + 1 })));
  }

  function createNew() {
    setEditing({
      id: 'new',
      name: '',
      location: '',
      rating: 5,
      text: '',
      vehicle: '',
      date: '',
      is_visible: true,
      sort_order: reviews.length + 1,
    });
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-white">
            {editing.id === 'new' ? 'Nouvel avis' : 'Modifier l\'avis'}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="btn-outline-gold">Annuler</button>
            <button onClick={saveReview} disabled={saving} className="btn-gold flex items-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Nom</label>
              <input
                type="text"
                value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Ville</label>
              <input
                type="text"
                value={editing.location}
                onChange={e => setEditing({ ...editing, location: e.target.value })}
                className="input-admin"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setEditing({ ...editing, rating: star })}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={star <= editing.rating ? 'fill-gold text-gold' : 'text-gray-600'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Avis</label>
            <textarea
              value={editing.text}
              onChange={e => setEditing({ ...editing, text: e.target.value })}
              className="input-admin h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Véhicule (optionnel)</label>
              <input
                type="text"
                value={editing.vehicle || ''}
                onChange={e => setEditing({ ...editing, vehicle: e.target.value })}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Date</label>
              <input
                type="text"
                value={editing.date}
                onChange={e => setEditing({ ...editing, date: e.target.value })}
                className="input-admin"
                placeholder="Janvier 2025"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.is_visible}
              onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
              className="w-4 h-4 accent-gold"
            />
            <span className="font-sans text-sm text-gray-300">Afficher sur le site</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white">Avis clients</h2>
        <button onClick={createNew} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {reviews.map((review, idx) => (
          <div
            key={review.id}
            className={`bg-black-700 border border-black-600 rounded-lg p-4 ${!review.is_visible ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveReview(review.id, 'up')}
                  disabled={idx === 0}
                  className="text-gray-500 hover:text-gold disabled:text-gray-700"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveReview(review.id, 'down')}
                  disabled={idx === reviews.length - 1}
                  className="text-gray-500 hover:text-gold disabled:text-gray-700"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-serif text-white">{review.name}</span>
                  <span className="text-xs text-gray-500">{review.location}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? 'fill-gold text-gold' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-serif text-gray-400 text-sm line-clamp-2">{review.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {review.vehicle && <span>{review.vehicle}</span>}
                  <span>{review.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(review)}
                  className="p-2 text-gray-400 hover:text-gold"
                >
                  {review.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => setEditing(review)}
                  className="p-2 text-gray-400 hover:text-gold"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
