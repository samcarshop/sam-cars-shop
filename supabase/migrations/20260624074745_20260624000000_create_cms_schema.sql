-- =============================================
-- CMS SCHEMA FOR SAM CARS SHOP
-- =============================================

-- 1. SITE SETTINGS (global configuration)
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Company Info
  company_name TEXT DEFAULT 'Sam Cars Shop',
  company_slogan TEXT DEFAULT 'Votre projet, notre signature.',
  company_phone TEXT DEFAULT '06 77 11 84 18',
  company_email TEXT DEFAULT 'scsprestigeshop@gmail.com',
  company_address TEXT DEFAULT '32 rue des Dames',
  company_city TEXT DEFAULT 'Puilboreau',
  company_postal_code TEXT DEFAULT '17138',
  company_country TEXT DEFAULT 'France',
  company_zone TEXT DEFAULT 'Toute la Charente-Maritime',
  
  -- Social Links
  social_instagram TEXT DEFAULT 'https://www.instagram.com/scs_shop17',
  social_facebook TEXT DEFAULT 'https://www.facebook.com/share/1HkbMSwu16',
  social_tiktok TEXT DEFAULT 'https://www.tiktok.com/@sam.cars.shop',
  
  -- Logo
  logo_url TEXT DEFAULT '/Le_logo_1_-removebg-preview_(1).png',
  logo_height INTEGER DEFAULT 112,
  
  -- Hero Section
  hero_background_url TEXT DEFAULT 'https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1',
  hero_title_line1 TEXT DEFAULT 'SAM CARS',
  hero_title_line2 TEXT DEFAULT 'SHOP',
  hero_subtitle TEXT DEFAULT 'Votre projet, notre signature.',
  hero_location TEXT DEFAULT 'La Rochelle · France',
  hero_cta1_text TEXT DEFAULT 'Découvrir nos véhicules',
  hero_cta2_text TEXT DEFAULT 'Confier mon véhicule',
  hero_cta1_href TEXT DEFAULT '#vehicules',
  hero_cta2_href TEXT DEFAULT '#depot-vente',
  
  -- Colors (hex values)
  color_primary TEXT DEFAULT '#D4AF37',
  color_secondary TEXT DEFAULT '#000000',
  color_background TEXT DEFAULT '#0A0A0A',
  color_text TEXT DEFAULT '#FFFFFF',
  color_text_muted TEXT DEFAULT '#9CA3AF',
  
  -- Footer
  footer_tagline TEXT DEFAULT 'Votre partenaire de confiance pour l''achat, la vente et la recherche de véhicules de caractère à La Rochelle.',
  footer_cta_text TEXT DEFAULT 'Prêt à confier votre véhicule ou trouver la perle rare ?',
  copyright_text TEXT DEFAULT '© 2025 Sam Cars Shop — La Rochelle. Tous droits réservés.',
  
  -- Contact Section
  contact_title TEXT DEFAULT 'Parlons de votre projet',
  contact_response_time TEXT DEFAULT 'Nous répondons à tous les messages sous 24h. Pour une réponse immédiate, appelez-nous directement.',
  google_maps_embed_url TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (id) VALUES (1);

-- 2. SEO SETTINGS
CREATE TABLE seo_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_title TEXT DEFAULT 'Sam Cars Shop — Votre projet, notre signature.',
  site_description TEXT DEFAULT 'Sam Cars Shop à La Rochelle — Dépôt-vente, véhicules de caractère, recherche personnalisée. Automobiles d''exception en Charente-Maritime.',
  site_keywords TEXT DEFAULT 'dépôt vente automobile La Rochelle, dépôt vente automobile Charente-Maritime, achat vente automobile La Rochelle, véhicule de collection La Rochelle, véhicule d''occasion Charente-Maritime, recherche personnalisée véhicule, mandataire automobile La Rochelle',
  og_title TEXT DEFAULT 'Sam Cars Shop — Véhicules de caractère à La Rochelle',
  og_description TEXT DEFAULT 'Dépôt-vente, achat et recherche de véhicules de collection et d''occasion. Accompagnement personnalisé sur toute la Charente-Maritime.',
  og_image_url TEXT DEFAULT '',
  twitter_card TEXT DEFAULT 'summary_large_image',
  google_site_verification TEXT DEFAULT '',
  
  -- Structured Data
  business_name TEXT DEFAULT 'Sam Cars Shop',
  business_type TEXT DEFAULT 'AutoDealer',
  business_price_range TEXT DEFAULT '€€',
  business_opening_hours TEXT DEFAULT 'Mo-Sa 09:00-19:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO seo_settings (id) VALUES (1);

-- 3. PAGES (for dynamic page creation)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  content JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  show_in_nav BOOLEAN DEFAULT false,
  nav_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pages (slug, title, meta_title, meta_description, show_in_nav, nav_order) VALUES
('accueil', 'Accueil', 'Sam Cars Shop — Votre projet, notre signature.', 'Découvrez nos véhicules de caractère et nos services de dépôt-vente à La Rochelle.', true, 1),
('vehicules', 'Nos Véhicules', 'Véhicules de collection et d''occasion - Sam Cars Shop', 'Découvrez notre sélection de véhicules de caractère à La Rochelle.', true, 2),
('depot-vente', 'Dépôt-Vente', 'Dépôt-vente automobile La Rochelle - Sam Cars Shop', 'Confiez la vente de votre véhicule en dépôt-vente. Aucun frais à avancer.', true, 3),
('recherche', 'Recherche Personnalisée', 'Recherche personnalisée de véhicule - Sam Cars Shop', 'Nous trouvons le véhicule de vos rêves selon vos critères.', true, 4),
('a-propos', 'À Propos', 'Sam Cars Shop - Votre partenaire automobile', 'Découvrez Sam Cars Shop, votre spécialiste automobile en Charente-Maritime.', false, 5),
('contact', 'Contact', 'Contactez Sam Cars Shop - La Rochelle', 'Contactez Sam Cars Shop pour votre projet automobile.', true, 6);

-- 4. SECTIONS (homepage section visibility and order)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  section_name TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sections (section_key, section_name, sort_order) VALUES
('hero', 'Hero', 1),
('vehicules', 'Nos Véhicules', 2),
('depot-vente', 'Dépôt-Vente', 3),
('recherche', 'Recherche Personnalisée', 4),
('temoignages', 'Témoignages', 5),
('contact', 'Contact', 6);

-- 5. MEDIA LIBRARY
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  title TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS (dynamic testimonials)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  vehicle TEXT DEFAULT '',
  date TEXT DEFAULT '',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert existing reviews
INSERT INTO reviews (name, location, rating, text, vehicle, date, sort_order) VALUES
('Alexandre M.', 'La Rochelle', 5, 'Sam Cars Shop a réalisé des photos absolument magnifiques de ma Mustang et l''a vendue en moins de deux semaines. Un service impeccable, professionnel et humain. Je recommande vivement.', 'Ford Mustang GT', 'Novembre 2024', 1),
('Sophie L.', 'Rochefort', 5, 'J''ai confié mon Combi VW en dépôt-vente. Pas un seul euro à avancer, des acheteurs sérieux uniquement. La transaction s''est déroulée parfaitement. Merci Sam Cars !', 'VW Combi 1975', 'Septembre 2024', 2),
('Thomas R.', 'Niort', 5, 'Cherchais un Jeep Wrangler depuis 6 mois sans succès. Sam Cars Shop l''a trouvé en 3 semaines, exactement selon mes critères. Service de recherche exceptionnel.', 'Jeep Wrangler', 'Janvier 2025', 3),
('Marie-Christine B.', 'La Rochelle', 5, 'Équipe passionnée et à l''écoute. Ma 2CV est partie chez un amoureux de la marque qui la méritait vraiment. C''est exactement ce que je souhaitais. Parfait du début à la fin.', 'Citroën 2CV', 'Mars 2025', 4),
('Julien P.', 'Saintes', 5, 'Le meilleur rapport qualité-service pour vendre son véhicule. Vraiment aucun frais à avancer, des photos pro et une vente rapide. Je n''hésite pas à les recommander.', 'Mini Cooper Classic', 'Décembre 2024', 5),
('Nathalie D.', 'Île de Ré', 5, 'Sam Cars Shop a géré tout le processus de A à Z pour la vente de notre Mercedes. Discrétion, professionnalisme et résultat au-delà de nos espérances. Merci !', 'Mercedes SL 500', 'Février 2025', 6);

-- 7. SERVICES (highlighted services)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Car',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO services (name, description, icon, sort_order) VALUES
('Achat de véhicules', 'Nous trouvons le véhicule idéal selon vos critères.', 'Search', 1),
('Vente de véhicules', 'Vendez votre véhicule au meilleur prix.', 'Tag', 2),
('Dépôt-vente automobile', 'Confiez-nous la vente, sans frais à avancer.', 'Store', 3),
('Recherche personnalisée', 'Nous recherchons le véhicule de vos rêves.', 'Search', 4),
('Véhicules de collection', 'Passionnés de voitures anciennes.', 'Car', 5),
('Véhicules du quotidien', 'Véhicules fiables pour tous les jours.', 'Car', 6),
('Déplacement à domicile', 'Nous nous déplaçons chez vous.', 'MapPin', 7),
('Gestion administrative complète', 'Papiers, formalités, nous gérons tout.', 'FileText', 8),
('Accompagnement vendeur/acheteur', 'Conseils personnalisés à chaque étape.', 'Users', 9);

-- 8. CONTACT MESSAGES
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SEARCH REQUESTS
CREATE TABLE search_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  brand TEXT NOT NULL,
  model TEXT DEFAULT '',
  budget TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public reads
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "public_read_seo_settings" ON seo_settings FOR SELECT TO public USING (true);
CREATE POLICY "public_read_pages" ON pages FOR SELECT TO public USING (is_published = true);
CREATE POLICY "public_read_sections" ON sections FOR SELECT TO public USING (true);
CREATE POLICY "public_read_media" ON media FOR SELECT TO public USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO public USING (is_visible = true);
CREATE POLICY "public_read_services" ON services FOR SELECT TO public USING (is_visible = true);

-- RLS Policies for contact (public can insert)
CREATE POLICY "public_insert_contact_messages" ON contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_insert_search_requests" ON search_requests FOR INSERT TO public WITH CHECK (true);

-- RLS Policies for admin (using anon key with service role through edge function, or we allow anon for simplicity)
-- Since we use edge function with service role, we don't need admin policies on frontend
-- But for direct admin access we allow anon for all operations (edge function handles auth)
CREATE POLICY "anon_all_site_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_seo_settings" ON seo_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pages" ON pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_sections" ON sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_media" ON media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_reviews" ON reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_contact_messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_search_requests" ON search_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_reviews_sort_order ON reviews(sort_order);
CREATE INDEX idx_services_sort_order ON services(sort_order);
CREATE INDEX idx_sections_sort_order ON sections(sort_order);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_search_requests_created_at ON search_requests(created_at DESC);

-- Create storage bucket for media uploads
-- Note: Storage bucket needs to be created via Supabase dashboard or API
