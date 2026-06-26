import { useState, useEffect } from 'react';
import { Save, Loader2, Check, Video } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';
import { MediaSelector } from './AdminMedia';

interface SiteSettings {
  company_name: string;
  company_slogan: string;
  company_phone: string;
  company_email: string;
  company_address: string;
  company_city: string;
  company_postal_code: string;
  company_country: string;
  company_zone: string;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  logo_url: string;
  logo_height: number;
  hero_background_url: string;
  hero_video_url: string;
  hero_use_video: boolean;
  hero_video_autoplay: boolean;
  hero_video_loop: boolean;
  hero_video_muted: boolean;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_location: string;
  hero_cta1_text: string;
  hero_cta2_text: string;
  hero_cta1_href: string;
  hero_cta2_href: string;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  footer_tagline: string;
  footer_cta_text: string;
  copyright_text: string;
  contact_title: string;
  contact_response_time: string;
  google_maps_embed_url: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'hero' | 'video' | 'contact' | 'social' | 'footer'>('company');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`${ADMIN_API_URL}/settings`, { headers: apiHeaders });
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        console.error('Error loading settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/settings`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: string | number | boolean) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={24} />
      </div>
    );
  }

  if (!settings) {
    return <div className="p-8 text-gray-500">Erreur de chargement</div>;
  }

  const tabs = [
    { id: 'company', label: 'Entreprise' },
    { id: 'hero', label: 'Hero' },
    { id: 'video', label: 'Video Hero' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Reseaux sociaux' },
    { id: 'footer', label: 'Footer' },
  ] as const;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-white">Parametres du site</h2>
        <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegarde' : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-black-600 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-sans text-sm rounded-t transition-colors ${
              activeTab === tab.id
                ? 'bg-gold/10 text-gold border-b-2 border-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-black-700 border border-black-600 rounded-lg p-6">
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={e => update('company_name', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Slogan</label>
                <input
                  type="text"
                  value={settings.company_slogan}
                  onChange={e => update('company_slogan', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Telephone</label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={e => update('company_phone', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={e => update('company_email', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Adresse</label>
                <input
                  type="text"
                  value={settings.company_address}
                  onChange={e => update('company_address', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Ville</label>
                <input
                  type="text"
                  value={settings.company_city}
                  onChange={e => update('company_city', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Code postal</label>
                <input
                  type="text"
                  value={settings.company_postal_code}
                  onChange={e => update('company_postal_code', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Zone d'activite</label>
                <input
                  type="text"
                  value={settings.company_zone}
                  onChange={e => update('company_zone', e.target.value)}
                  className="input-admin"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Logo</label>
              <MediaSelector
                currentUrl={settings.logo_url}
                onSelect={(url) => update('logo_url', url)}
                accept="image"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Hauteur du logo (px)</label>
              <input
                type="number"
                value={settings.logo_height}
                onChange={e => update('logo_height', parseInt(e.target.value))}
                className="input-admin w-32"
              />
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Image de fond</label>
              <MediaSelector
                currentUrl={settings.hero_background_url}
                onSelect={(url) => update('hero_background_url', url)}
                accept="image"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Titre ligne 1</label>
                <input
                  type="text"
                  value={settings.hero_title_line1}
                  onChange={e => update('hero_title_line1', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Titre ligne 2</label>
                <input
                  type="text"
                  value={settings.hero_title_line2}
                  onChange={e => update('hero_title_line2', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Sous-titre</label>
                <input
                  type="text"
                  value={settings.hero_subtitle}
                  onChange={e => update('hero_subtitle', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Localisation</label>
                <input
                  type="text"
                  value={settings.hero_location}
                  onChange={e => update('hero_location', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Bouton 1 texte</label>
                <input
                  type="text"
                  value={settings.hero_cta1_text}
                  onChange={e => update('hero_cta1_text', e.target.value)}
                  className="input-admin"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Bouton 2 texte</label>
                <input
                  type="text"
                  value={settings.hero_cta2_text}
                  onChange={e => update('hero_cta2_text', e.target.value)}
                  className="input-admin"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 flex items-start gap-3">
              <Video size={20} className="text-gold mt-0.5" />
              <div>
                <p className="font-sans text-sm text-gold">Video Hero en arriere-plan</p>
                <p className="font-sans text-xs text-gray-500 mt-1">
                  Utilisez une video MP4 pour un effet dynamique. La video remplacera l'image de fond.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black-800 border border-black-600 rounded-lg">
              <div>
                <p className="font-sans text-sm text-white">Utiliser une video</p>
                <p className="font-sans text-xs text-gray-500">Activer la video en arriere-plan</p>
              </div>
              <button
                onClick={() => update('hero_use_video', !settings.hero_use_video)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.hero_use_video ? 'bg-gold' : 'bg-black-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  settings.hero_use_video ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Video MP4</label>
              <MediaSelector
                currentUrl={settings.hero_video_url || ''}
                onSelect={(url) => update('hero_video_url', url)}
                accept="video"
              />
            </div>

            {settings.hero_video_url && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-black-800 border border-black-600 rounded-lg">
                  <p className="font-sans text-sm text-white">Lecture auto</p>
                  <button
                    onClick={() => update('hero_video_autoplay', !settings.hero_video_autoplay)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      settings.hero_video_autoplay ? 'bg-gold' : 'bg-black-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      settings.hero_video_autoplay ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-black-800 border border-black-600 rounded-lg">
                  <p className="font-sans text-sm text-white">Boucle</p>
                  <button
                    onClick={() => update('hero_video_loop', !settings.hero_video_loop)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      settings.hero_video_loop ? 'bg-gold' : 'bg-black-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      settings.hero_video_loop ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-black-800 border border-black-600 rounded-lg">
                  <p className="font-sans text-sm text-white">Muet</p>
                  <button
                    onClick={() => update('hero_video_muted', !settings.hero_video_muted)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      settings.hero_video_muted ? 'bg-gold' : 'bg-black-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      settings.hero_video_muted ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Titre contact</label>
              <input
                type="text"
                value={settings.contact_title}
                onChange={e => update('contact_title', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Message reponse rapide</label>
              <textarea
                value={settings.contact_response_time}
                onChange={e => update('contact_response_time', e.target.value)}
                className="input-admin h-24"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Google Maps embed URL</label>
              <input
                type="text"
                value={settings.google_maps_embed_url}
                onChange={e => update('google_maps_embed_url', e.target.value)}
                className="input-admin"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-600 mt-1">Allez sur Google Maps, cliquez Partager puis Integrer une carte, puis copiez l'URL src de l'iframe</p>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Instagram</label>
              <input
                type="text"
                value={settings.social_instagram}
                onChange={e => update('social_instagram', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Facebook</label>
              <input
                type="text"
                value={settings.social_facebook}
                onChange={e => update('social_facebook', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">TikTok</label>
              <input
                type="text"
                value={settings.social_tiktok}
                onChange={e => update('social_tiktok', e.target.value)}
                className="input-admin"
              />
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Texte descriptif footer</label>
              <textarea
                value={settings.footer_tagline}
                onChange={e => update('footer_tagline', e.target.value)}
                className="input-admin h-24"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Texte CTA footer</label>
              <input
                type="text"
                value={settings.footer_cta_text}
                onChange={e => update('footer_cta_text', e.target.value)}
                className="input-admin"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">Copyright</label>
              <input
                type="text"
                value={settings.copyright_text}
                onChange={e => update('copyright_text', e.target.value)}
                className="input-admin"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
