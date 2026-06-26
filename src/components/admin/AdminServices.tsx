import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, Eye, EyeOff, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_visible: boolean;
  sort_order: number;
}

const iconOptions = ['Car', 'Search', 'Tag', 'Store', 'MapPin', 'FileText', 'Users', 'Shield', 'Wrench', 'Camera'];

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/services`, { headers: apiHeaders });
      const data = await res.json();
      setServices(data);
    } catch (e) {
      console.error('Error loading services');
    } finally {
      setLoading(false);
    }
  }

  async function saveService() {
    if (!editing) return;
    setSaving(true);
    try {
      const url = editing.id && editing.id !== 'new'
        ? `${ADMIN_API_URL}/services/${editing.id}`
        : `${ADMIN_API_URL}/services`;
      const method = editing.id && editing.id !== 'new' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: apiHeaders,
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editing.id === 'new') {
          setServices(prev => [...prev, saved]);
        } else {
          setServices(prev => prev.map(s => s.id === saved.id ? saved : s));
        }
        setEditing(null);
      }
    } catch (e) {
      console.error('Error saving service');
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Error deleting service');
    }
  }

  async function toggleVisibility(service: Service) {
    try {
      const res = await fetch(`${ADMIN_API_URL}/services/${service.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ is_visible: !service.is_visible }),
      });
      if (res.ok) {
        setServices(prev =>
          prev.map(s => s.id === service.id ? { ...s, is_visible: !s.is_visible } : s)
        );
      }
    } catch (e) {
      console.error('Error toggling visibility');
    }
  }

  function moveService(id: string, direction: 'up' | 'down') {
    const idx = services.findIndex(s => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === services.length - 1)) return;

    const newServices = [...services];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newServices[idx], newServices[swapIdx]] = [newServices[swapIdx], newServices[idx]];
    setServices(newServices.map((s, i) => ({ ...s, sort_order: i + 1 })));
  }

  function createNew() {
    setEditing({
      id: 'new',
      name: '',
      description: '',
      icon: 'Car',
      is_visible: true,
      sort_order: services.length + 1,
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
            {editing.id === 'new' ? 'Nouveau service' : 'Modifier le service'}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="btn-outline-gold">Annuler</button>
            <button onClick={saveService} disabled={saving} className="btn-gold flex items-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Sauvegarder
            </button>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6 space-y-6">
          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Nom du service</label>
            <input
              type="text"
              value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
              className="input-admin"
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })}
              className="input-admin h-24"
            />
          </div>
          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Icône</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  onClick={() => setEditing({ ...editing, icon })}
                  className={`px-4 py-2 rounded transition-colors ${
                    editing.icon === icon
                      ? 'bg-gold text-black'
                      : 'bg-black-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
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
        <h2 className="font-serif text-2xl text-white">Services</h2>
        <button onClick={createNew} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {services.map((service, idx) => (
          <div
            key={service.id}
            className={`bg-black-700 border border-black-600 rounded-lg p-4 flex items-center gap-4 ${!service.is_visible ? 'opacity-50' : ''}`}
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveService(service.id, 'up')}
                disabled={idx === 0}
                className="text-gray-500 hover:text-gold disabled:text-gray-700"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => moveService(service.id, 'down')}
                disabled={idx === services.length - 1}
                className="text-gray-500 hover:text-gold disabled:text-gray-700"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex-grow">
              <h3 className="font-serif text-white">{service.name}</h3>
              <p className="font-sans text-xs text-gray-400">{service.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleVisibility(service)}
                className="p-2 text-gray-400 hover:text-gold"
              >
                {service.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => setEditing(service)}
                className="p-2 text-gray-400 hover:text-gold"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => deleteService(service.id)}
                className="p-2 text-gray-400 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
