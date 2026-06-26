import { useState, useRef, useEffect, FormEvent } from 'react';
import { Search, ChevronDown, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface FormData {
  brand: string;
  model: string;
  budget: string;
  message: string;
  name: string;
  phone: string;
  email: string;
}

const budgets = [
  'Moins de 5 000 €',
  '5 000 – 10 000 €',
  '10 000 – 20 000 €',
  '20 000 – 35 000 €',
  '35 000 – 50 000 €',
  'Plus de 50 000 €',
];

const popularBrands = ['Porsche', 'Ferrari', 'Lamborghini', 'BMW', 'Mercedes', 'Audi', 'Range Rover', 'Jeep'];

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

export default function PersonalizedSearch() {
  const [form, setForm] = useState<FormData>({ brand: '', model: '', budget: '', message: '', name: '', phone: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const titleRef = useReveal();
  const formRef = useReveal(200);
  const { settings } = useSiteSettings();
  const bg = settings.section_search_bg;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('search_requests').insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        brand: form.brand,
        model: form.model || null,
        budget: form.budget,
        message: form.message || null,
        status: 'pending',
      });

      // Send notification email
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'search',
            data: form,
          }),
        });
      } catch (notifError) {
        console.error('Notification error (non-blocking):', notifError);
      }

      setSubmitted(true);
    } catch (e) {
      console.error('Error submitting search request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="recherche" className="py-24 relative overflow-hidden" style={bg ? { background: bg } : { background: '#0a0a0a' }}>
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute -top-40 right-0 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div ref={titleRef} className="reveal-left">
            <p className="section-subtitle mb-4">{settings.search_section_subtitle}</p>
            <h2 className="section-title mb-6">
              {settings.search_section_title.split(' ').slice(0, -2).join(' ')}<br />
              <span className="gold-gradient-text">{settings.search_section_title.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <div className="gold-line mb-8" />
            <p className="font-serif text-gray-300 font-light text-lg leading-relaxed mb-10">
              {settings.search_section_description}
            </p>

            {/* Popular brands */}
            <div>
              <p className="font-sans text-xs text-gray-500 tracking-widest uppercase mb-4">Marques recherchées</p>
              <div className="flex flex-wrap gap-2">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setForm((prev) => ({ ...prev, brand }))}
                    className={`font-sans text-xs px-4 py-2 border transition-all duration-200 ${
                      form.brand === brand
                        ? 'border-gold text-gold bg-gold/10'
                        : 'border-black-400 text-gray-400 hover:border-gold/40 hover:text-gray-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div ref={formRef} className="reveal-right">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-5 py-16 text-center bg-black-700 border border-gold/20 px-8">
                <CheckCircle size={48} className="text-gold" />
                <h3 className="font-serif text-2xl text-white">Demande envoyée !</h3>
                <p className="font-serif text-gray-400 font-light">
                  Nous avons bien reçu votre recherche et vous recontacterons très prochainement.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ brand: '', model: '', budget: '', message: '', name: '', phone: '', email: '' }); }}
                  className="btn-outline-gold text-xs py-2.5 px-6 mt-2"
                >
                  Nouvelle recherche
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Marque *</label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="Ex: Porsche"
                      required
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Modèle</label>
                    <input
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="Ex: 911 Carrera"
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Budget *</label>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    required
                    className="select-luxury"
                  >
                    <option value="" disabled>Sélectionner un budget</option>
                    {budgets.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-[2.6rem] text-gold pointer-events-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Votre nom *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Prénom Nom"
                      required
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Téléphone *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="06 xx xx xx xx"
                      required
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label className="font-sans text-xs text-gray-400 tracking-wider uppercase block mb-2">Votre projet</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Décrivez le véhicule idéal : année, kilométrage, couleur, options..."
                    rows={4}
                    className="input-luxury resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black-900/30 border-t-black-900 rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                  ) : (
                  <><Search size={14} />{settings.search_cta_text}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
