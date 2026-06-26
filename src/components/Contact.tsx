import { useState, useRef, useEffect, FormEvent } from 'react';
import { Phone, MapPin, Send, CheckCircle, Facebook, Instagram, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const subjects = [
  "Achat d'un véhicule",
  'Dépôt-vente',
  'Recherche personnalisée',
  'Renseignement général',
  'Autre',
];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
    </svg>
  );
}

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const headerRef = useReveal();
  const leftRef = useReveal();
  const rightRef = useReveal(200);
  const { settings } = useSiteSettings();

  const phone = settings.company_phone;
  const email = settings.company_email;
  const address = settings.company_address;
  const city = settings.company_city;
  const postalCode = settings.company_postal_code;
  const instagram = settings.social_instagram;
  const facebook = settings.social_facebook;
  const tiktok = settings.social_tiktok;
  const mapsUrl = settings.google_maps_embed_url;
  const bg = settings.section_contact_bg;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      });

      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'contact', data: form }),
        });
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError);
      }

      setSubmitted(true);
    } catch (e) {
      console.error('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden" style={bg ? { background: bg } : { background: '#0a0a0a' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute -bottom-40 left-0 w-96 h-96 bg-gold/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="reveal text-center mb-16" ref={headerRef}>
          <p className="section-subtitle mb-4">{settings.contact_section_subtitle}</p>
          <h2 className="section-title mb-6">
            {settings.contact_section_title.split(' ').slice(0, -1).join(' ')}<br />
            <span className="gold-gradient-text">{settings.contact_section_title.split(' ').slice(-1)[0]}</span>
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gold/40" />
            <div className="w-1 h-1 bg-gold rotate-45" />
            <div className="h-px w-16 bg-gold/40" />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div ref={leftRef} className="reveal-left lg:col-span-2 space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-1">Téléphone</p>
                <a href={`tel:${phone.replace(/\s/g, '')}`}
                  className="font-serif text-2xl text-white hover:text-gold transition-colors duration-300">
                  {phone}
                </a>
                <p className="font-sans text-xs text-gray-500 mt-1">{settings.contact_availability}</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-1">Email</p>
                <a href={`mailto:${email}`}
                  className="font-serif text-xl text-white hover:text-gold transition-colors duration-300">
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-1">Adresse</p>
                <p className="font-serif text-lg text-white">{address}</p>
                <p className="font-sans text-sm text-gray-400">{postalCode} {city}</p>
                <p className="font-sans text-xs text-gray-500 mt-1">{settings.company_zone}, {settings.company_country}</p>
              </div>
            </div>

            <div>
              <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-4">Suivez-nous</p>
              <div className="flex gap-3">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300" aria-label="Facebook">
                    <Facebook size={16} />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300" aria-label="TikTok">
                    <TikTokIcon />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-black-700 border border-gold/20 p-6">
              <p className="font-sans text-xs text-gold tracking-widest uppercase mb-2">Réponse rapide garantie</p>
              <p className="font-serif text-gray-300 font-light text-sm leading-relaxed">
                {settings.contact_response_time}
              </p>
            </div>
          </div>

          {/* Right form */}
          <div ref={rightRef} className="reveal-right lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-5 py-20 text-center bg-black-700 border border-gold/20 px-8 h-full">
                <CheckCircle size={52} className="text-gold" />
                <h3 className="font-serif text-3xl text-white font-light">Message envoyé !</h3>
                <p className="font-serif text-gray-400 font-light max-w-sm leading-relaxed">
                  Merci pour votre message. Nous vous recontacterons dans les plus brefs délais.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }); }}
                  className="btn-outline-gold text-xs py-2.5 px-6 mt-2">
                  Nouveau message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Votre nom *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Prénom Nom" required className="input-luxury" />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Téléphone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="06 xx xx xx xx" className="input-luxury" />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required className="input-luxury" />
                </div>

                <div className="relative">
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Sujet *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required className="select-luxury">
                    <option value="" disabled>Choisir un sujet</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-4 top-[2.6rem] text-gold pointer-events-none text-xs">▾</span>
                </div>

                <div>
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder="Décrivez votre projet ou posez vos questions..." rows={5} required className="input-luxury resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-gold w-full gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black-900/30 border-t-black-900 rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <><Send size={14} />Envoyer le message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {mapsUrl && (
          <div className="mt-16">
            <div className="aspect-video bg-black-700 rounded-lg overflow-hidden border border-black-600">
              <iframe src={mapsUrl} width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Sam Cars Shop" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
