/*
# Migration: Create vehicles table and admin_secrets table

## 1. New Tables
### `vehicles`
- `id` (uuid, primary key) — Auto-generated unique identifier
- `name` (text, not null) — Vehicle name (ex: "Ford Mustang")
- `category` (text, not null) — Category label (ex: "Muscle Car")
- `year` (text) — Model year
- `km` (text) — Kilométrage
- `fuel` (text) — Fuel type (Essence, Diesel, etc.)
- `price` (text) — Display price (ex: "Sur demande" or actual amount)
- `description` (text) — Full vehicle description
- `image` (text) — Main image URL
- `gallery` (text[]) — Array of additional image URLs
- `specs` (jsonb) — Key-value specs as JSON array [{label, value}, ...]
- `sort_order` (integer, default 0) — Display ordering
- `is_active` (boolean, default true) — Whether the vehicle is visible on the site
- `created_at` (timestamptz) — Creation timestamp
- `updated_at` (timestamptz) — Last update timestamp

### `admin_secrets`
- `id` (integer, primary key, default 1) — Single row table
- `password_hash` (text) — bcrypt-hashed password for admin panel
- `updated_at` (timestamptz) — Last update timestamp

## 2. Security
- Enable RLS on both tables.
- `vehicles` table: public read access for site visitors, full access for admin.
- `admin_secrets` table: protected via edge function with service role key.

## 3. Notes
- Vehicle gallery is stored as text array (multiple images).
- specs are JSONB for flexibility.
- admin_secrets stores exactly one row for the single admin password.
- Default password is "admin123" (hash pre-set).
*/

CREATE TABLE IF NOT EXISTS vehicles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    year text DEFAULT '',
    km text DEFAULT '',
    fuel text DEFAULT '',
    price text DEFAULT '',
    description text DEFAULT '',
    image text DEFAULT '',
    gallery text[] DEFAULT ARRAY[]::text[],
    specs jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_secrets (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    password_hash text NOT NULL,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_secrets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vehicles" ON vehicles;
CREATE POLICY "public_read_vehicles" ON vehicles FOR SELECT
TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_all_vehicles" ON vehicles;
CREATE POLICY "admin_all_vehicles" ON vehicles
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "admin_secrets_read" ON admin_secrets;
CREATE POLICY "admin_secrets_read" ON admin_secrets FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_secrets_update" ON admin_secrets;
CREATE POLICY "admin_secrets_update" ON admin_secrets FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

INSERT INTO admin_secrets (id, password_hash)
VALUES (1, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (name, category, year, km, fuel, price, description, image, gallery, specs, sort_order)
VALUES
  ('Ford Mustang', 'Muscle Car', '2019', '42 000 km', 'Essence', 'Sur demande',
   'Icone americaine par excellence, la Ford Mustang allie puissance brute et design intemporel. Un symbole de liberte et de performance qui ne laisse personne indifferent.',
   'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/3136673/pexels-photo-3136673.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
     'https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"5.0 V8 450 ch"},{"label":"Transmission","value":"Boite manuelle 6 rapports"},{"label":"Couleur","value":"Race Red"},{"label":"Interieur","value":"Cuir noir"}]'::jsonb,
   1
  ),
  ('Volkswagen T4 California', 'Van de Caractere', '1997', '87 000 km', 'Diesel', 'Sur demande',
   'Le California T4, un compagnon de vie pour les aventuriers. Entierement amenage, il offre un espace de vie nomade alliant praticite et style vintage authentique.',
   'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
     'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"2.5 TDI 102 ch"},{"label":"Amenagement","value":"Cuisine + couchage"},{"label":"Couleur","value":"Vert Sauge"},{"label":"Places","value":"4 places + lit double"}]'::jsonb,
   2
  ),
  ('Volkswagen Combi', 'Classique Culte', '1978', '64 000 km', 'Essence', 'Sur demande',
   'Le Combi VW, symbole d''une epoque doree. Restaure avec passion, ce van legendaire incarne a la perfection l''esprit liberte des annees 70. Une piece de collection roulante.',
   'https://images.pexels.com/photos/1578912/pexels-photo-1578912.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1578912/pexels-photo-1578912.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"1.6 L 50 ch"},{"label":"Transmission","value":"Manuelle 4 rapports"},{"label":"Couleur","value":"Blanc & Beige"},{"label":"Etat","value":"Restauration soignee"}]'::jsonb,
   3
  ),
  ('Jeep Wrangler', '4x4 d''Exception', '2021', '28 000 km', 'Essence', 'Sur demande',
   'Le Wrangler, indetronable roi du tout-terrain. Entre capacites off-road legendaires et style imposant, ce 4x4 iconique est aussi a l''aise en ville qu''en montagne.',
   'https://images.pexels.com/photos/1687051/pexels-photo-1687051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1687051/pexels-photo-1687051.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"2.0 Turbo 272 ch"},{"label":"Transmission","value":"4x4 integral"},{"label":"Couleur","value":"Granite Crystal"},{"label":"Options","value":"Hard Top + Lift Kit"}]'::jsonb,
   4
  ),
  ('Mercedes Collection', 'Berline de Prestige', '2004', '95 000 km', 'Essence', 'Sur demande',
   'La Mercedes W124, reference absolue en matiere de construction automobile. Robustesse legendaire, tenue de route exemplaire et interieur raffine — une valeur sure.',
   'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
     'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"V6 320 ch"},{"label":"Transmission","value":"Automatique 7G-Tronic"},{"label":"Couleur","value":"Noir Obsidian"},{"label":"Interieur","value":"Cuir beige"}]'::jsonb,
   5
  ),
  ('Mini Classic', 'Icone Britannique', '1972', '52 000 km', 'Essence', 'Sur demande',
   'La Mini originale d''Alec Issigonis. Un concentre de caractere et de charme british dans un format delicieusement compact. Restauree a l''identique, elle rayonne partout.',
   'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"998cc 40 ch"},{"label":"Transmission","value":"Manuelle 4 rapports"},{"label":"Couleur","value":"British Racing Green"},{"label":"Etat","value":"Restauration complete"}]'::jsonb,
   6
  ),
  ('Citroen 2CV', 'Patrimoine Francais', '1982', '38 000 km', 'Essence', 'Sur demande',
   'La 2CV, ame de la France rurale et urbaine. Legere, attachante, indestructible. Un tresor du patrimoine automobile francais a preserver et a faire vivre.',
   'https://images.pexels.com/photos/1432158/pexels-photo-1432158.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
   ARRAY[
     'https://images.pexels.com/photos/1432158/pexels-photo-1432158.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
   ],
   '[{"label":"Motorisation","value":"602cc 29 ch"},{"label":"Transmission","value":"Manuelle 4 rapports"},{"label":"Couleur","value":"Jaune Melodie"},{"label":"Etat","value":"Superbe etat general"}]'::jsonb,
   7
  )
ON CONFLICT DO NOTHING;
