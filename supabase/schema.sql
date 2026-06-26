-- NetSpy ITAM - Supabase Schema
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS devices CASCADE;

CREATE TABLE IF NOT EXISTS devices (
  mac_address VARCHAR PRIMARY KEY,
  custom_name VARCHAR,
  last_known_ip VARCHAR NOT NULL,
  vendor VARCHAR,
  is_managed BOOLEAN DEFAULT false,
  cpu_model VARCHAR,
  ram_gb INTEGER,
  os_version VARCHAR,
  hostname VARCHAR,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_devices_is_managed ON devices(is_managed);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access to devices" ON devices;
CREATE POLICY "Allow authenticated full access to devices"
  ON devices FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE devices TO postgres, service_role, authenticated, anon;
