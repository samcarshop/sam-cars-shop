import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings } = useSiteSettings();

  const navItems = [
    { label: settings.nav_item_1 || 'Véhicules', href: '#vehicules' },
    { label: settings.nav_item_2 || 'Dépôt-Vente', href: '#depot-vente' },
    { label: settings.nav_item_3 || 'Recherche', href: '#recherche' },
    { label: settings.nav_item_4 || 'Avis', href: '#temoignages' },
    { label: settings.nav_item_5 || 'Contact', href: '#contact' },
  ];
  const logoUrl = settings.logo_url || '/Le_logo_1_-removebg-preview_(1).png';
  const companyName = settings.company_name || 'Sam Cars Shop';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black-900/95 backdrop-blur-sm gold-border-bottom py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => handleNav('#accueil')}
            className="flex items-center gap-3 group"
          >
            <img
              src={logoUrl}
              alt={companyName}
              className="h-10 w-auto transition-opacity duration-300 group-hover:opacity-80"
            />
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="font-sans text-sm tracking-widest uppercase text-gray-300 hover:text-gold transition-colors duration-300"
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/90" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-16 left-0 right-0 bg-black-900 border-b border-black-600 p-6 transform transition-transform duration-300 ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="font-sans text-lg tracking-widest text-gray-300 hover:text-gold transition-colors text-left py-2"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
