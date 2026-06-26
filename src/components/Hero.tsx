import { useEffect, useRef } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const TITLE_SIZES: Record<string, string> = {
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
};

const TITLE_WEIGHTS: Record<string, number> = {
  'light': 300,
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
};

export default function Hero() {
  const titleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { settings } = useSiteSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current && settings?.hero_use_video && settings?.hero_video_url) {
      videoRef.current.play().catch(() => {});
    }
  }, [settings?.hero_use_video, settings?.hero_video_url]);

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  };

  const s = settings;

  const bgImage = s?.hero_background_url || 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const logoUrl = s?.logo_url || '/Le_logo_1_-removebg-preview_(1).png';
  const logoH = s?.logo_height || 112;
  const useVideo = s?.hero_use_video && s?.hero_video_url;
  const overlayOpacity = s?.hero_overlay_opacity ?? 0.7;
  const textAlign = (s?.hero_text_align || 'center') as 'left' | 'center' | 'right';
  const titleFontSize = TITLE_SIZES[s?.hero_title_size || '5xl'] || '3rem';
  const titleFontWeight = TITLE_WEIGHTS[s?.hero_title_weight || 'light'] || 300;
  const primaryColor = s?.color_primary || '#c9a227';

  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {useVideo ? (
        <video
          ref={videoRef}
          src={s!.hero_video_url}
          autoPlay={s?.hero_video_autoplay !== false}
          loop={s?.hero_video_loop !== false}
          muted={s?.hero_video_muted !== false}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-yellow-600/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-yellow-600/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div
        ref={titleRef}
        className="relative z-10 px-6 max-w-5xl mx-auto w-full"
        style={{
          textAlign,
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'opacity 1s ease, transform 1s ease',
          paddingTop: `${s?.hero_padding_top ?? 80}px`,
          paddingBottom: `${s?.hero_padding_bottom ?? 80}px`,
        }}
      >
        {/* Logo */}
        <div className="animate-fade-in mb-8" style={{ display: 'flex', justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}>
          <img
            src={logoUrl}
            alt={s?.company_name || 'Sam Cars Shop'}
            className="filter brightness-125 animate-float"
            style={{ height: `${Math.min(logoH, 144)}px`, width: 'auto' }}
          />
        </div>

        {/* Title */}
        <h1 className="font-serif leading-tight" style={{ fontSize: titleFontSize, fontWeight: titleFontWeight }}>
          <span className="block text-white">{s?.hero_title_line1 || 'SAM CARS'}</span>
          <span className="block" style={{ color: primaryColor }}>{s?.hero_title_line2 || 'SHOP'}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="font-sans tracking-widest uppercase mt-6"
          style={{ color: '#d1d5db', fontSize: '0.9rem' }}
        >
          {s?.hero_subtitle || 'Votre projet, notre signature.'}
        </p>

        {/* Location */}
        <div
          className="flex items-center gap-2 mt-3"
          style={{ justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}
        >
          <MapPin size={14} style={{ color: primaryColor }} />
          <span
            className="font-sans text-xs tracking-widest uppercase"
            style={{ color: primaryColor }}
          >
            {s?.hero_location || 'La Rochelle - France'}
          </span>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 mt-10"
          style={{ justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center' }}
        >
          <button
            onClick={() => scrollTo(s?.hero_cta1_href || '#vehicules')}
            className="btn-gold"
          >
            {s?.hero_cta1_text || 'Decouvrir nos vehicules'}
          </button>
          <button
            onClick={() => scrollTo(s?.hero_cta2_href || '#depot-vente')}
            className="btn-outline-gold"
          >
            {s?.hero_cta2_text || 'Confier mon vehicule'}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo(s?.hero_cta1_href || '#vehicules')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-gold transition-colors animate-bounce"
        style={{ color: `${primaryColor}50` }}
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
