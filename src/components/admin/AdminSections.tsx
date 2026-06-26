import { useState, useEffect } from 'react';
import { Save, Loader2, Check, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface Section {
  id: string;
  section_key: string;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
}

export default function AdminSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/sections`, { headers: apiHeaders });
      const data = await res.json();
      setSections(data);
    } catch (e) {
      console.error('Error loading sections');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/sections`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(sections),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Error saving sections');
    } finally {
      setSaving(false);
    }
  }

  function toggleVisibility(id: string) {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, is_visible: !s.is_visible } : s)
    );
  }

  function moveSection(id: string, direction: 'up' | 'down') {
    const idx = sections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];

    setSections(newSections.map((s, i) => ({ ...s, sort_order: i + 1 })));
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
        <div>
          <h2 className="font-serif text-2xl text-white">Sections de la page d'accueil</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            Activez, désactivez et réorganisez les sections
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="bg-black-700 border border-black-600 rounded-lg overflow-hidden">
        <div className="divide-y divide-black-600">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`flex items-center gap-4 px-6 py-4 ${!section.is_visible ? 'opacity-50' : ''}`}
            >
              <GripVertical size={18} className="text-gray-600" />

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={idx === 0}
                  className="text-gray-500 hover:text-gold disabled:text-gray-700"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={idx === sections.length - 1}
                  className="text-gray-500 hover:text-gold disabled:text-gray-700"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-grow">
                <p className="font-serif text-white">{section.section_name}</p>
                <p className="font-sans text-xs text-gray-500">Position {section.sort_order}</p>
              </div>

              <button
                onClick={() => toggleVisibility(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  section.is_visible
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                {section.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                {section.is_visible ? 'Visible' : 'Masqué'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gold/5 border border-gold/20 rounded-lg">
        <p className="font-sans text-sm text-gold">Aperçu des sections actives :</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {sections.filter(s => s.is_visible).sort((a, b) => a.sort_order - b.sort_order).map(s => (
            <span key={s.id} className="px-3 py-1 bg-gold/10 text-gold text-xs rounded-full">
              {s.section_name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
