import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: any[];
  is_published: boolean;
  show_in_nav: boolean;
  nav_order: number;
}

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/pages`, { headers: apiHeaders });
      const data = await res.json();
      setPages(data);
    } catch (e) {
      console.error('Error loading pages');
    } finally {
      setLoading(false);
    }
  }

  async function savePage() {
    if (!editing) return;
    setSaving(true);
    try {
      const url = editing.id && editing.id !== 'new'
        ? `${ADMIN_API_URL}/pages/${editing.id}`
        : `${ADMIN_API_URL}/pages`;
      const method = editing.id && editing.id !== 'new' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editing.id === 'new') {
          setPages(prev => [...prev, saved]);
        } else {
          setPages(prev => prev.map(p => p.id === saved.id ? saved : p));
        }
        setEditing(null);
      }
    } catch (e) {
      console.error('Error saving page');
    } finally {
      setSaving(false);
    }
  }

  async function deletePage(id: string) {
    if (!confirm('Supprimer cette page ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/pages/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Error deleting page');
    }
  }

  function createNew() {
    setEditing({
      id: 'new',
      slug: '',
      title: '',
      meta_title: '',
      meta_description: '',
      content: [],
      is_published: true,
      show_in_nav: false,
      nav_order: pages.length + 1,
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
            {editing.id === 'new' ? 'Nouvelle page' : 'Modifier la page'}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="btn-outline-gold">
              Annuler
            </button>
            <button onClick={savePage} disabled={saving} className="btn-gold flex items-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={editing.slug}
                onChange={e => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="ma-page"
                className="input-admin"
              />
              <p className="text-xs text-gray-600 mt-1">URL: /{editing.slug || 'ma-page'}</p>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">
                Titre de la page
              </label>
              <input
                type="text"
                value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="input-admin"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">
              Meta titre (SEO)
            </label>
            <input
              type="text"
              value={editing.meta_title}
              onChange={e => setEditing({ ...editing, meta_title: e.target.value })}
              className="input-admin"
            />
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">
              Meta description (SEO)
            </label>
            <textarea
              value={editing.meta_description}
              onChange={e => setEditing({ ...editing, meta_description: e.target.value })}
              className="input-admin h-24"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={e => setEditing({ ...editing, is_published: e.target.checked })}
                className="w-4 h-4 accent-gold"
              />
              <span className="font-sans text-sm text-gray-300">Publiée</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.show_in_nav}
                onChange={e => setEditing({ ...editing, show_in_nav: e.target.checked })}
                className="w-4 h-4 accent-gold"
              />
              <span className="font-sans text-sm text-gray-300">Afficher dans la navigation</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white">Pages</h2>
        <button onClick={createNew} className="btn-gold flex items-center gap-2">
          <Plus size={16} />
          Nouvelle page
        </button>
      </div>

      <div className="bg-black-700 border border-black-600 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black-600">
              <th className="text-left px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider w-12"></th>
              <th className="text-left px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="text-left px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="text-left px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider">Navigation</th>
              <th className="text-left px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="text-right px-4 py-3 font-sans text-xs text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className="border-b border-black-600 last:border-b-0 hover:bg-black-600/30">
                <td className="px-4 py-4">
                  <GripVertical size={14} className="text-gray-600" />
                </td>
                <td className="px-4 py-4 font-serif text-white">{page.title}</td>
                <td className="px-4 py-4 font-sans text-sm text-gray-400">/{page.slug}</td>
                <td className="px-4 py-4">
                  {page.show_in_nav ? (
                    <span className="text-xs text-green-400">Oui</span>
                  ) : (
                    <span className="text-xs text-gray-600">Non</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {page.is_published ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <Eye size={12} /> Publiée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <EyeOff size={12} /> Brouillon
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(page)}
                      className="p-2 text-gray-400 hover:text-gold transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
