-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('media', 'media', true, 52428800, ARRAY['image/*', 'video/mp4', 'video/webm', 'application/pdf']),
  ('vehicles', 'vehicles', true, 52428800, ARRAY['image/*', 'video/mp4']),
  ('logos', 'logos', true, 10485760, ARRAY['image/*']),
  ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/*'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Public read access media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('media', 'vehicles', 'logos', 'documents'));

CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('media', 'vehicles', 'logos', 'documents'));

CREATE POLICY "Authenticated update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('media', 'vehicles', 'logos', 'documents'));

CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('media', 'vehicles', 'logos', 'documents'));

-- Add columns for video background to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
ADD COLUMN IF NOT EXISTS hero_use_video BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_video_autoplay BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_video_loop BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS hero_video_muted BOOLEAN DEFAULT true;

-- Add service images to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image columns to sections for visual editor
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_video_url TEXT;

-- Create visual editor settings table
CREATE TABLE IF NOT EXISTS visual_editor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email notifications settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_recipients TEXT[] DEFAULT ARRAY['scsprestigeshop@gmail.com'],
  notify_on_contact BOOLEAN DEFAULT true,
  notify_on_search_request BOOLEAN DEFAULT true,
  notify_on_depot_vente BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO notification_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
