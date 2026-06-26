import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  // Company
  company_name: string;
  company_slogan: string;
  company_phone: string;
  company_email: string;
  company_address: string;
  company_city: string;
  company_postal_code: string;
  company_country: string;
  company_zone: string;
  // Social
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  // Branding
  logo_url: string;
  logo_height: number;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  // Typography
  font_heading: string;
  font_body: string;
  // Hero - media
  hero_background_url: string;
  hero_video_url: string;
  hero_use_video: boolean;
  hero_video_autoplay: boolean;
  hero_video_loop: boolean;
  hero_video_muted: boolean;
  // Hero - content
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_location: string;
  hero_cta1_text: string;
  hero_cta2_text: string;
  hero_cta1_href: string;
  hero_cta2_href: string;
  // Hero - visual style
  hero_overlay_opacity: number;
  hero_text_align: string;
  hero_title_size: string;
  hero_title_weight: string;
  hero_padding_top: number;
  hero_padding_bottom: number;
  // Vehicles section
  vehicles_section_subtitle: string;
  vehicles_section_title: string;
  vehicles_section_tagline: string;
  vehicles_contact_btn: string;
  // Depot-vente section
  depot_subtitle: string;
  depot_title: string;
  depot_description: string;
  depot_badge_text: string;
  depot_cta_text: string;
  depot_quote: string;
  depot_background_url: string;
  // Reviews section
  reviews_section_subtitle: string;
  reviews_section_title: string;
  // Search section
  search_section_subtitle: string;
  search_section_title: string;
  search_section_description: string;
  search_cta_text: string;
  // Contact section
  contact_section_subtitle: string;
  contact_section_title: string;
  contact_availability: string;
  contact_title: string;
  contact_response_time: string;
  google_maps_embed_url: string;
  // Navigation
  nav_item_1: string;
  nav_item_2: string;
  nav_item_3: string;
  nav_item_4: string;
  nav_item_5: string;
  // Section backgrounds
  section_vehicles_bg: string;
  section_depot_bg: string;
  section_reviews_bg: string;
  section_search_bg: string;
  section_contact_bg: string;
  section_footer_bg: string;
  // Footer
  footer_tagline: string;
  footer_cta_text: string;
  copyright_text: string;
}

export const defaultSettings: SiteSettings = {
  company_name: 'Sam Cars Shop',
  company_slogan: 'Votre projet, notre signature.',
  company_phone: '06 77 11 84 18',
  company_email: 'scsprestigeshop@gmail.com',
  company_address: '32 rue des Dames',
  company_city: 'Puilboreau',
  company_postal_code: '17138',
  company_country: 'France',
  company_zone: 'Charente-Maritime',
  social_instagram: 'https://www.instagram.com/scs_shop17',
  social_facebook: 'https://www.facebook.com/share/1HkbMSwu16',
  social_tiktok: 'https://www.tiktok.com/@sam.cars.shop',
  logo_url: '/Le_logo_1_-removebg-preview_(1).png',
  logo_height: 80,
  color_primary: '#c9a227',
  color_secondary: '#a07c1e',
  color_background: '#0a0a0a',
  color_text: '#ffffff',
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  hero_background_url: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
  hero_video_url: '',
  hero_use_video: false,
  hero_video_autoplay: true,
  hero_video_loop: true,
  hero_video_muted: true,
  hero_title_line1: 'L\'automobile',
  hero_title_line2: 'd\'exception',
  hero_subtitle: 'Votre concessionnaire spécialisé dans les véhicules de prestige et de collection en Charente-Maritime.',
  hero_location: 'Puilboreau, Charente-Maritime',
  hero_cta1_text: 'Découvrir nos véhicules',
  hero_cta2_text: 'Nous contacter',
  hero_cta1_href: '#vehicules',
  hero_cta2_href: '#contact',
  hero_overlay_opacity: 50,
  hero_text_align: 'center',
  hero_title_size: '6xl',
  hero_title_weight: 'light',
  hero_padding_top: 120,
  hero_padding_bottom: 120,
  vehicles_section_subtitle: 'Notre sélection',
  vehicles_section_title: 'Véhicules d\'Exception',
  vehicles_section_tagline: 'Chaque véhicule est sélectionné avec soin pour son histoire, son caractère et son potentiel.',
  vehicles_contact_btn: 'Nous contacter',
  depot_subtitle: 'Dépôt-Vente',
  depot_title: 'Vendez mieux, sans effort',
  depot_description: 'Confiez-nous la vente de votre véhicule. Nous nous occupons de tout — de la mise en valeur à la finalisation — pendant que vous conservez pleinement votre voiture.',
  depot_badge_text: 'Aucun frais à avancer',
  depot_cta_text: 'Confier mon véhicule',
  depot_quote: 'Votre véhicule mérite d\'être mis en valeur.',
  depot_background_url: 'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg',
  reviews_section_subtitle: 'Témoignages',
  reviews_section_title: 'Ce que disent nos clients',
  search_section_subtitle: 'Recherche sur-mesure',
  search_section_title: 'Le véhicule de vos rêves',
  search_section_description: 'Vous n\'avez pas trouvé le véhicule qui vous correspond ? Décrivez-nous votre projet et nous activons notre réseau pour le dénicher.',
  search_cta_text: 'Lancer ma recherche',
  contact_section_subtitle: 'Contact',
  contact_section_title: 'Parlons de votre projet',
  contact_availability: 'Disponible 7j/7',
  contact_title: 'Parlons de votre projet',
  contact_response_time: 'Nous répondons à tous les messages sous 24h. Pour une réponse immédiate, appelez-nous directement.',
  google_maps_embed_url: '',
  nav_item_1: 'Véhicules',
  nav_item_2: 'Dépôt-Vente',
  nav_item_3: 'Recherche',
  nav_item_4: 'Avis',
  nav_item_5: 'Contact',
  section_vehicles_bg: '',
  section_depot_bg: '',
  section_reviews_bg: '',
  section_search_bg: '',
  section_contact_bg: '',
  section_footer_bg: '',
  footer_tagline: 'Votre partenaire de confiance pour l\'achat et la vente de véhicules de prestige.',
  footer_cta_text: 'Prêt à confier votre véhicule ou trouver la perle rare ?',
  copyright_text: '© 2025 Sam Cars Shop. Tous droits réservés.',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setSettings({ ...defaultSettings, ...data });
    } catch (e) {
      console.error('Error loading site settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
