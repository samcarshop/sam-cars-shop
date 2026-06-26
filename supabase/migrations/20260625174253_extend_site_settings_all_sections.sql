-- Vehicles section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS vehicles_section_subtitle TEXT DEFAULT 'Notre sélection';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS vehicles_section_title TEXT DEFAULT 'Véhicules d''Exception';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS vehicles_section_tagline TEXT DEFAULT 'Chaque véhicule est sélectionné avec soin pour vous offrir le meilleur de l''automobile de collection et de prestige.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS vehicles_contact_btn TEXT DEFAULT 'Nous contacter';

-- Depot-vente section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_subtitle TEXT DEFAULT 'Dépôt-Vente';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_title TEXT DEFAULT 'Vendez mieux, sans effort';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_description TEXT DEFAULT 'Confiez-nous votre véhicule et nous nous occupons de tout : photos professionnelles, diffusion sur nos réseaux et auprès de notre réseau d''acheteurs qualifiés.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_badge_text TEXT DEFAULT 'Aucun frais à avancer';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_cta_text TEXT DEFAULT 'Confier mon véhicule';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_quote TEXT DEFAULT 'Votre véhicule mérite d''être mis en valeur.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS depot_background_url TEXT DEFAULT 'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg';

-- Reviews section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS reviews_section_subtitle TEXT DEFAULT 'Témoignages';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS reviews_section_title TEXT DEFAULT 'Ce que disent nos clients';

-- Search section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS search_section_subtitle TEXT DEFAULT 'Recherche sur-mesure';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS search_section_title TEXT DEFAULT 'Le véhicule de vos rêves';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS search_section_description TEXT DEFAULT 'Décrivez le véhicule de vos rêves et nous activons notre réseau pour vous le trouver.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS search_cta_text TEXT DEFAULT 'Lancer ma recherche';

-- Contact section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_section_subtitle TEXT DEFAULT 'Contact';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_section_title TEXT DEFAULT 'Parlons de votre projet';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_availability TEXT DEFAULT 'Disponible 7j/7';

-- Navigation
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_item_1 TEXT DEFAULT 'Véhicules';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_item_2 TEXT DEFAULT 'Dépôt-Vente';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_item_3 TEXT DEFAULT 'Recherche';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_item_4 TEXT DEFAULT 'Avis';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_item_5 TEXT DEFAULT 'Contact';

-- Section background colors
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_vehicles_bg TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_depot_bg TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_reviews_bg TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_search_bg TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_contact_bg TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS section_footer_bg TEXT DEFAULT '';

-- Typography globals
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Playfair Display';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';
