import { useState, useEffect } from 'react';
import { Save, Loader2, Check, Bell, BellOff, Mail, Smartphone, Trash2, Plus, MessageSquare } from 'lucide-react';
import { ADMIN_API_URL, apiHeaders } from '../../lib/supabase';

interface NotificationSettings {
  id: number;
  email_recipients: string[];
  notify_on_contact: boolean;
  notify_on_search_request: boolean;
  notify_on_depot_vente: boolean;
  sms_phone_number: string;
  sms_enabled: boolean;
}

interface PushToken {
  id: string;
  token: string;
  device_type: string;
  created_at: string;
}

export default function AdminNotifications() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [pushTokens, setPushTokens] = useState<PushToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [settingsRes, tokensRes] = await Promise.all([
        fetch(`${ADMIN_API_URL}/notifications`, { headers: apiHeaders }),
        fetch(`${ADMIN_API_URL}/push-tokens`, { headers: apiHeaders }),
      ]);
      const settingsData = await settingsRes.json();
      const tokensData = await tokensRes.json();
      setSettings(settingsData);
      setPushTokens(Array.isArray(tokensData) ? tokensData : []);
    } catch (e) {
      console.error('Error loading notification settings');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch(`${ADMIN_API_URL}/notifications`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error saving');
    } finally {
      setSaving(false);
    }
  }

  function addRecipient() {
    if (!newRecipient || !settings) return;
    if (!newRecipient.includes('@')) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }
    setSettings({
      ...settings,
      email_recipients: [...settings.email_recipients, newRecipient.trim()],
    });
    setNewRecipient('');
  }

  function removeRecipient(email: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      email_recipients: settings.email_recipients.filter(e => e !== email),
    });
  }

  async function deletePushToken(id: string) {
    if (!confirm('Supprimer cet appareil ?')) return;
    try {
      await fetch(`${ADMIN_API_URL}/push-tokens/${id}`, {
        method: 'DELETE',
        headers: apiHeaders,
      });
      setPushTokens(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error('Error deleting push token');
    }
  }

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

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-white">Notifications</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            Configuration des alertes et notifications
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegarde' : 'Sauvegarder'}
        </button>
      </div>

      {/* Notification Types */}
      <div className="bg-black-700 border border-black-600 rounded-lg p-6 mb-6">
        <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Bell size={16} />
          Types de notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black-800 rounded">
            <div>
              <p className="font-sans text-sm text-white">Messages de contact</p>
              <p className="font-sans text-xs text-gray-500">Formulaire de contact rempli</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notify_on_contact: !settings.notify_on_contact })}
              className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                settings.notify_on_contact ? 'bg-gold' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                settings.notify_on_contact ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-black-800 rounded">
            <div>
              <p className="font-sans text-sm text-white">Demandes de recherche</p>
              <p className="font-sans text-xs text-gray-500">Recherche personnalisee</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notify_on_search_request: !settings.notify_on_search_request })}
              className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                settings.notify_on_search_request ? 'bg-gold' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                settings.notify_on_search_request ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-black-800 rounded">
            <div>
              <p className="font-sans text-sm text-white">Depot-vente</p>
              <p className="font-sans text-xs text-gray-500">Demande de depot-vente</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notify_on_depot_vente: !settings.notify_on_depot_vente })}
              className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                settings.notify_on_depot_vente ? 'bg-gold' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                settings.notify_on_depot_vente ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Email Recipients */}
      <div className="bg-black-700 border border-black-600 rounded-lg p-6 mb-6">
        <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Mail size={16} />
          Destinataires email
        </h3>
        <div className="space-y-3">
          {settings.email_recipients.map((email) => (
            <div key={email} className="flex items-center gap-3 p-3 bg-black-800 rounded">
              <Mail size={16} className="text-gray-500" />
              <span className="flex-1 text-sm text-white">{email}</span>
              <button
                onClick={() => removeRecipient(email)}
                className="p-1 text-gray-500 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <input
              type="email"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="nouvelle@email.com"
              className="input-admin flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRecipient();
                }
              }}
            />
            <button onClick={addRecipient} className="btn-gold flex items-center gap-2">
              <Plus size={16} />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-black-700 border border-black-600 rounded-lg p-6 mb-6">
        <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-1 flex items-center gap-2">
          <MessageSquare size={16} />
          Notifications SMS
        </h3>
        <p className="text-xs text-gray-500 mb-4">Recevez un SMS sur votre téléphone à chaque nouveau formulaire reçu.</p>

        <div className="flex items-center justify-between p-4 bg-black-800 rounded mb-4">
          <div>
            <p className="font-sans text-sm text-white">Activer les SMS</p>
            <p className="font-sans text-xs text-gray-500">Nécessite TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER dans les secrets</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, sms_enabled: !settings.sms_enabled })}
            className={`w-12 h-6 rounded-full transition-colors flex items-center ${settings.sms_enabled ? 'bg-gold' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${settings.sms_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div>
          <label className="block font-sans text-xs text-gray-400 uppercase tracking-wider mb-2">
            Numéro de téléphone (format: 06 xx xx xx xx)
          </label>
          <input
            type="tel"
            value={settings.sms_phone_number || ''}
            onChange={e => setSettings({ ...settings, sms_phone_number: e.target.value })}
            placeholder="06 77 11 84 18"
            className="input-admin"
          />
          <p className="text-xs text-gray-600 mt-1">Les numéros français (06/07) sont automatiquement convertis au format international (+33).</p>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-black-700 border border-black-600 rounded-lg p-6">
        <h3 className="font-sans text-sm text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Smartphone size={16} />
          Notifications push sur mobile
        </h3>

        <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-gold">Pour recevoir des notifications push sur votre telephone :</p>
          <ol className="text-xs text-gray-400 mt-2 space-y-1 list-decimal list-inside">
            <li>Installez l'application Sam Cars Shop sur votre telephone</li>
            <li>Connectez-vous a votre compte</li>
            <li>Acceptez les notifications push</li>
          </ol>
        </div>

        {pushTokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellOff size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun appareil enregistre</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pushTokens.map((token) => (
              <div key={token.id} className="flex items-center gap-3 p-3 bg-black-800 rounded">
                <Smartphone size={16} className="text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-white">{token.device_type || 'Appareil mobile'}</p>
                  <p className="text-xs text-gray-500">
                    Ajoute le {new Date(token.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => deletePushToken(token.id)}
                  className="p-1 text-gray-500 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
