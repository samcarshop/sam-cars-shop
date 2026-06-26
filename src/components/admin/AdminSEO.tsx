import { useState, useEffect } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  twitter_card: string;
  google_site_verification: string;
  business_name: string;
  business_type: string;
  business_price_range: string;
  business_opening_hours: string;
}

export default function AdminSEO() {
  const [seo, setSeo] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSEO();
  }, []);

  async function loadSEO() {
    try {
      const res = await fetch(`${ADMIN_API_URL}/seo`, { headers: apiHeaders });
      const data = await res.json();
      setSeo(data);
    } catch (e) {
      console.error('Error loading SEO');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!seo) return;
    setSaving(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/seo`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(seo),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Error saving SEO');
    } finally {
      setSaving(false);
    }
  }

  function update(key: keyof SEOSettings, value: string) {
    if (seo) setSeo({ ...seo, [key]: value });
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  if (!seo) {
    return <div className="p-8 text-gray-500">Erreur de chargement</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white">Référencement SEO</h2>
        <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4">Informations générales</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Titre du site</label>
              <input
                type="text"
                value={seo.site_title}
                onChange={e => update('site_title', e.target.value)}
                className="input-admin"
              />
              <p className="text-xs text-gray-600 mt-1">50-60 caractères recommandé</p>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Description du site</label>
              <textarea
                value={seo.site_description}
                onChange={e => update('site_description', e.target.value)}
                className="input-admin h-24"
              />
              <p className="text-xs text-gray-600 mt-1">{seo.site_description.length}/160 caractères</p>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Mots-clés (séparés par des virgules)</label>
              <textarea
                value={seo.site_keywords}
                onChange={e => update('site_keywords', e.target.value)}
                className="input-admin h-20"
              />
            </div>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4">Open Graph (Facebook, Instagram)</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">OG Titre</label>
              <input
                type="text"
                value={seo.og_title}
                onChange={e => update('og_title', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">OG Description</label>
              <textarea
                value={seo.og_description}
                onChange={e => update('og_description', e.target.value)}
                className="input-admin h-20"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">OG Image URL</label>
              <input
                type="text"
                value={seo.og_image_url}
                onChange={e => update('og_image_url', e.target.value)}
                className="input-admin"
                placeholder="https://..."
              />
              {seo.og_image_url && (
                <img src={seo.og_image_url} alt="OG preview" className="mt-2 h-20 object-contain rounded" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4">Données structurées (Local Business)</h3>
          <p className="text-xs text-gray-500 mb-4">Ces informations aident Google à comprendre votre entreprise</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                value={seo.business_name}
                onChange={e => update('business_name', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Type d'entreprise</label>
              <input
                type="text"
                value={seo.business_type}
                onChange={e => update('business_type', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Gamme de prix</label>
              <input
                type="text"
                value={seo.business_price_range}
                onChange={e => update('business_price_range', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Horaires d'ouverture</label>
              <input
                type="text"
                value={seo.business_opening_hours}
                onChange={e => update('business_opening_hours', e.target.value)}
                className="input-admin"
              />
            </div>
          </div>
        </div>

        <div className="bg-black-700 border border-black-600 rounded-lg p-6">
          <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4">Google Search Console</h3>
          <div>
            <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Code de vérification Google</label>
            <input
              type="text"
              value={seo.google_site_verification}
              onChange={e => update('google_site_verification', e.target.value)}
              className="input-admin"
              placeholder="Ex: abc123def456..."
            />
            <p className="text-xs text-gray-600 mt-1">Collez ici le code fourni par Google Search Console</p>
          </div>
        </div>
      </div>
    </div>
  );
}
