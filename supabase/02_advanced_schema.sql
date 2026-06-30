-- ----------------------------------------------------
-- New Tables for Software Inventory & Alerts
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS installed_software (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mac_address text REFERENCES devices(mac_address) ON DELETE CASCADE,
  name text NOT NULL,
  version text,
  publisher text,
  install_date text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(mac_address, name, version)
);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE installed_software ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow full access for now (since we use service_role mostly, and anonymous for UI temporarily if needed)
CREATE POLICY "Allow full access to software" ON installed_software FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);
