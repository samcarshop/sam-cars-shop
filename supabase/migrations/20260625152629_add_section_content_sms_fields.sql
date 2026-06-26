-- Add section content fields to site_settings for visual editor
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS vehicles_title TEXT DEFAULT 'Nos Véhicules',
ADD COLUMN IF NOT EXISTS vehicles_subtitle TEXT DEFAULT 'Notre sélection',
ADD COLUMN IF NOT EXISTS depot_title TEXT DEFAULT 'Confiez-nous votre véhicule',
ADD COLUMN IF NOT EXISTS depot_description TEXT DEFAULT 'Sam Cars Shop prend en charge intégralement la vente de votre véhicule. Aucun frais à avancer, photos professionnelles, gestion des visites.',
ADD COLUMN IF NOT EXISTS depot_cta_text TEXT DEFAULT 'Confier mon véhicule',
ADD COLUMN IF NOT EXISTS search_title TEXT DEFAULT 'Vous ne trouvez pas votre véhicule idéal ?',
ADD COLUMN IF NOT EXISTS search_description TEXT DEFAULT 'Décrivez-nous le véhicule de vos rêves et nous le trouvons pour vous.',
ADD COLUMN IF NOT EXISTS reviews_title TEXT DEFAULT 'Ce que disent nos clients';

-- Add SMS phone number to notification settings
ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS sms_phone_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;
