import { useEffect, useRef } from 'react';
import { Camera, Megaphone, Users, HandshakeIcon, ShieldCheck, TrendingUp } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const steps = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Vous gardez votre véhicule',
    description: 'Votre voiture reste chez vous jusqu\'à la vente. Aucune immobilisation, aucun risque.',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Photos professionnelles',
    description: 'Nous réalisons des prises de vue soignées qui mettent en valeur chaque détail de votre véhicule.',
  },
  {
    number: '03',
    icon: Megaphone,
    title: 'Diffusion des annonces',
    description: 'Nous publions et gérons vos annonces sur les meilleures plateformes automobile du marché.',
  },
  {
    number: '04',
    icon: Users,
    title: 'Gestion des contacts',
    description: 'Nous filtrons, qualifions et gérons tous les acheteurs potentiels à votre place.',
  },
  {
    number: '05',
    icon: HandshakeIcon,
    title: 'Nous trouvons l\'acheteur',
    description: 'Sam Cars Shop sécurise la transaction et s\'assure d\'une vente au meilleur prix.',
  },
];

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

export default function DepotVente() {
  const titleRef = useReveal();
  const imageRef = useReveal(200);
  const { settings } = useSiteSettings();

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bg = settings.section_depot_bg;
  const bgImage = settings.depot_background_url || 'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg';

  return (
    <section id="depot-vente" className="py-24 relative overflow-hidden" style={bg ? { background: bg } : { background: '#111111' }}>
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImage}?auto=compress&cs=tinysrgb&w=1920&dpr=1')` }}
        />
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — text content */}
          <div>
            <div ref={titleRef} className="reveal-left">
              <p className="section-subtitle mb-4">{settings.depot_subtitle}</p>
              <h2 className="section-title mb-6">
                {settings.depot_title.split(',')[0]},<br />
                <span className="gold-gradient-text">{settings.depot_title.split(',').slice(1).join(',').trim() || 'sans effort'}</span>
              </h2>
              <div className="gold-line mb-8" />
              <p className="font-serif text-gray-300 font-light text-lg leading-relaxed mb-8">
                {settings.depot_description}
              </p>

              {/* Key badge */}
              <div className="inline-flex items-center gap-3 bg-gold/10 border border-gold/30 px-6 py-4 mb-10">
                <TrendingUp size={20} className="text-gold flex-shrink-0" />
                <div>
                  <p className="font-sans text-gold text-xs tracking-widest uppercase font-semibold">{settings.depot_badge_text}</p>
                  <p className="font-sans text-gray-400 text-xs mt-0.5">Notre rémunération est prélevée uniquement sur la vente</p>
                </div>
              </div>

              <button onClick={scrollToContact} className="btn-gold">
                {settings.depot_cta_text}
              </button>
            </div>
          </div>

          {/* Right — steps */}
          <div className="space-y-1">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* Bottom image strip */}
        <div ref={imageRef} className="reveal mt-20">
          <div className="relative h-64 overflow-hidden">
            <img
              src={`${bgImage}?auto=compress&cs=tinysrgb&w=1600&h=600&dpr=1`}
              alt="Photographe automobile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black-900/90 via-black-900/50 to-black-900/90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-serif text-2xl md:text-3xl text-white font-light italic text-center px-6">
                "{settings.depot_quote}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </section>
  );
}

function StepCard({ step, delay }: { step: typeof steps[0]; delay: number }) {
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

  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className="reveal-right flex items-start gap-5 p-5 border border-transparent hover:border-gold/20 hover:bg-black-600/30 transition-all duration-300 group"
    >
      <div className="flex-shrink-0 w-12 h-12 border border-gold/30 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/5 transition-all duration-300">
        <Icon size={18} className="text-gold" />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="font-sans text-xs text-gold/50 font-medium tracking-widest">{step.number}</span>
          <h3 className="font-sans text-sm font-semibold text-white uppercase tracking-wider">{step.title}</h3>
        </div>
        <p className="font-serif text-gray-400 font-light text-sm leading-relaxed">{step.description}</p>
      </div>
    </div>
  );
}
