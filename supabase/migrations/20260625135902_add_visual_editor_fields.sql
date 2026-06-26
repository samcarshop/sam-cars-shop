-- Add comprehensive visual editor settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_padding_top INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS hero_padding_bottom INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS hero_title_size VARCHAR(20) DEFAULT '5xl',
ADD COLUMN IF NOT EXISTS hero_subtitle_size VARCHAR(20) DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS hero_button_size VARCHAR(20) DEFAULT 'base',
ADD COLUMN IF NOT EXISTS hero_overlay_opacity DECIMAL(3,2) DEFAULT 0.70,
ADD COLUMN IF NOT EXISTS hero_text_align VARCHAR(20) DEFAULT 'center',
ADD COLUMN IF NOT EXISTS hero_title_weight VARCHAR(20) DEFAULT 'light';

-- Add vehicle info auto-send settings
CREATE TABLE IF NOT EXISTS vehicle_inquiry_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  auto_send_info BOOLEAN DEFAULT true,
  email_template TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO vehicle_inquiry_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Add push notification tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  device_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
