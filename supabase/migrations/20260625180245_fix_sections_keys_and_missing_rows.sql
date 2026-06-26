
-- Fix the 'reviews' key to match the frontend's expected 'temoignages'
UPDATE sections SET section_key = 'temoignages', section_name = 'Témoignages' WHERE section_key = 'reviews';

-- Add missing navigation and footer sections
INSERT INTO sections (section_key, section_name, is_visible, sort_order)
VALUES
  ('navigation', 'Navigation', true, 0),
  ('footer', 'Footer', true, 7)
ON CONFLICT DO NOTHING;
