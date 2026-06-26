import { Facebook, Instagram, Phone, MapPin, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
    </svg>
  );
}

const navLinks = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Nos véhicules', href: '#vehicules' },
  { label: 'Dépôt-Vente', href: '#depot-vente' },
  { label: 'Recherche personnalisée', href: '#recherche' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const { settings } = useSiteSettings();

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const logoUrl = settings?.logo_url || '/Le_logo_1_-removebg-preview_(1).png';
  const companyName = settings?.company_name || 'Sam Cars Shop';
  const footerTagline = settings?.footer_tagline || 'Votre partenaire de confiance pour l\'achat, la vente et la recherche de véhicules de caractère à La Rochelle.';
  const footerCtaText = settings?.footer_cta_text || 'Prêt à confier votre véhicule ou trouver la perle rare ?';
  const copyrightText = settings?.copyright_text || '© 2025 Sam Cars Shop — La Rochelle. Tous droits réservés.';
  const phone = settings?.company_phone || '06 77 11 84 18';
  const city = settings?.company_city || 'La Rochelle';
  const zone = settings?.company_zone || 'Charente-Maritime';
  const instagram = settings?.social_instagram;
  const facebook = settings?.social_facebook;
  const tiktok = settings?.social_tiktok;
  const slogan = settings?.company_slogan || 'Votre projet, notre signature.';

  return (
    <footer className="bg-black-900 border-t border-black-400">
      {/* Top bar CTA */}
      <div className="bg-gold py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-black-900 font-semibold text-sm tracking-wider uppercase text-center">
            {footerCtaText}
          </p>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 bg-black-900 text-gold font-sans font-semibold text-sm tracking-wider uppercase px-6 py-3 hover:bg-black-700 transition-colors duration-300 flex-shrink-0"
          >
            <Phone size={14} />
            {phone}
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img
              src={logoUrl}
              alt={companyName}
              className="h-16 w-auto mb-5"
            />
            <p className="font-serif text-gray-400 font-light text-sm leading-relaxed mb-5">
              {footerTagline}
            </p>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={13} className="text-gold flex-shrink-0" />
              <span className="font-sans text-xs">{city}, {zone}</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-xs text-gold tracking-widest uppercase font-semibold mb-5">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="flex items-center gap-2 font-sans text-sm text-gray-400 hover:text-gold transition-colors duration-300 group"
                  >
                    <ChevronRight size={12} className="text-gold/0 group-hover:text-gold transition-colors duration-300" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-sans text-xs text-gold tracking-widest uppercase font-semibold mb-5">Nous suivre</h4>
            <div className="flex gap-3 mb-8">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-black-400 flex items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-all duration-300"
                  aria-label="TikTok"
                >
                  <TikTokIcon />
                </a>
              )}
            </div>

            <h4 className="font-sans text-xs text-gold tracking-widest uppercase font-semibold mb-4">Contact direct</h4>
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 font-serif text-xl text-white hover:text-gold transition-colors duration-300"
            >
              <Phone size={16} className="text-gold" />
              {phone}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black-400 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-gray-600">
            {copyrightText}
          </p>
          <p className="font-serif text-xs text-gold/40 italic">
            {slogan}
          </p>
        </div>
      </div>
    </footer>
  );
}
