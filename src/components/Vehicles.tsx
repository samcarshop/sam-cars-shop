import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Phone, Gauge, Calendar, Fuel, Loader2, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types/vehicle';
import { useSiteSettings } from '../context/SiteSettingsContext';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

interface ModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

function VehicleModal({ vehicle, onClose }: ModalProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const gallery = vehicle.gallery ?? [];
  const safeGallery = gallery.length > 0 ? gallery : [vehicle.image];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreen) setFullscreen(false);
        else onClose();
      }
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'ArrowRight') nextImg();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose, fullscreen, imgIdx]);

  const nextImg = () => setImgIdx((prev) => (prev + 1) % safeGallery.length);
  const prevImg = () => setImgIdx((prev) => (prev - 1 + safeGallery.length) % safeGallery.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImg();
      else prevImg();
    }
    setTouchStart(null);
  };

  const contact = () => {
    onClose();
    setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  const specs = Array.isArray(vehicle.specs) ? vehicle.specs : [];

  // Fullscreen mode
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-black/50 text-white hover:text-gold transition-colors"
        >
          <X size={24} />
        </button>

        {safeGallery.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 text-white hover:text-gold transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 text-white hover:text-gold transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div
          className="w-full h-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={safeGallery[imgIdx]}
            alt={vehicle.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {safeGallery.map((_, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === imgIdx ? 'bg-gold' : 'bg-white/40'}`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-6 text-white font-sans text-sm">
          {imgIdx + 1} / {safeGallery.length}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-black-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-gold hover:text-gold transition-colors duration-300"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          <div
            className="relative h-72 md:h-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img src={safeGallery[imgIdx]} alt={vehicle.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black-900/60 to-transparent" />

            {safeGallery.length > 1 && (
              <>
                {/* Arrow navigation */}
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/60 text-white hover:text-gold transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/60 text-white hover:text-gold transition-colors"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {safeGallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === imgIdx ? 'bg-gold' : 'bg-white/40'}`}
                    />
                  ))}
                </div>

                {/* Photo counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-xs text-white font-sans">
                  {imgIdx + 1} / {safeGallery.length}
                </div>
              </>
            )}

            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreen(true)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 text-white hover:text-gold transition-colors"
            >
              <Maximize2 size={16} />
            </button>

            <div className="absolute top-4 left-4">
              <span className="font-sans text-xs tracking-widest uppercase text-gold bg-black-900/80 px-3 py-1">
                {vehicle.category}
              </span>
            </div>
          </div>

          <div className="p-8 flex flex-col">
            <h3 className="font-serif text-3xl font-light text-white mb-1">{vehicle.name}</h3>
            <p className="font-sans text-xs text-gold tracking-widest uppercase mb-5">{vehicle.category}</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-black-600 p-3 text-center">
                <Calendar size={14} className="text-gold mx-auto mb-1" />
                <p className="font-sans text-xs text-gray-400">Année</p>
                <p className="font-sans text-sm text-white font-medium">{vehicle.year}</p>
              </div>
              <div className="bg-black-600 p-3 text-center">
                <Gauge size={14} className="text-gold mx-auto mb-1" />
                <p className="font-sans text-xs text-gray-400">Kilométrage</p>
                <p className="font-sans text-xs text-white font-medium">{vehicle.km}</p>
              </div>
              <div className="bg-black-600 p-3 text-center">
                <Fuel size={14} className="text-gold mx-auto mb-1" />
                <p className="font-sans text-xs text-gray-400">Énergie</p>
                <p className="font-sans text-sm text-white font-medium">{vehicle.fuel}</p>
              </div>
            </div>

            <p className="font-serif text-gray-300 font-light leading-relaxed mb-6 text-sm">
              {vehicle.description}
            </p>

            <div className="space-y-2 mb-6">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between items-center py-2 border-b border-black-400">
                  <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">{spec.label}</span>
                  <span className="font-sans text-xs text-white font-medium">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <p className="font-serif text-2xl text-gold mb-4">{vehicle.price}</p>
              <button onClick={contact} className="btn-gold w-full gap-2">
                <Phone size={14} /> Nous contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const sectionRef = useReveal();
  const { settings } = useSiteSettings();

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          setError('Erreur de chargement des véhicules');
        } else {
          setVehicles(data ?? []);
        }
      } catch {
        setError('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const bg = settings.section_vehicles_bg;

  return (
    <section id="vehicules" className="py-24" style={bg ? { background: bg } : { background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div ref={sectionRef} className="reveal text-center mb-16">
          <p className="section-subtitle mb-4">{settings.vehicles_section_subtitle}</p>
          <h2 className="section-title mb-6">
            {settings.vehicles_section_title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="gold-gradient-text">{settings.vehicles_section_title.split(' ').slice(-1)[0]}</span>
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gold/40" />
            <div className="w-1 h-1 bg-gold rotate-45" />
            <div className="h-px w-16 bg-gold/40" />
          </div>
          <p className="font-serif text-gray-400 font-light text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            {settings.vehicles_section_tagline}
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-gold animate-spin" />
            <p className="font-serif text-gray-400 font-light">Chargement des véhicules...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <p className="font-serif text-red-400 font-light">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle, i) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} delay={i * 80} onClick={() => setSelected(vehicle)} />
            ))}
          </div>
        )}
      </div>

      {selected && <VehicleModal vehicle={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function VehicleCard({ vehicle, delay, onClick }: { vehicle: Vehicle; delay: number; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => el.classList.add('visible'), delay); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="reveal card-vehicle group" onClick={onClick}>
      <div className="relative h-56 overflow-hidden">
        <img src={vehicle.image} alt={vehicle.name} className="card-img w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black-900/80 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-gold flex items-center justify-center">
            <ChevronRight size={14} className="text-black-900" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className="font-sans text-xs text-gold tracking-widest uppercase bg-black-900/80 px-2 py-0.5">{vehicle.category}</span>
        </div>
      </div>
      <div className="p-5 border-t border-black-400 group-hover:border-gold/30 transition-colors duration-300">
        <h3 className="font-serif text-xl font-light text-white mb-1 group-hover:text-gold transition-colors duration-300">{vehicle.name}</h3>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-sans text-xs text-gray-500">{vehicle.year}</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="font-sans text-xs text-gray-500">{vehicle.km}</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="font-sans text-xs text-gray-500">{vehicle.fuel}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-serif text-gold text-sm">{vehicle.price}</span>
          <span className="font-sans text-xs text-gold tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all duration-200">Détails <ChevronRight size={12} /></span>
        </div>
      </div>
    </div>
  );
}
