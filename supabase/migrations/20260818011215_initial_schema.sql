-- Create custom types
CREATE TYPE site_status AS ENUM ('draft', 'published', 'suspended');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'user'
);

-- Reserved subdomains table
CREATE TABLE reserved_subdomains (
  word TEXT PRIMARY KEY
);

-- Sites table
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL,
  title TEXT,
  status site_status DEFAULT 'draft',
  template_id TEXT,
  custom_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast subdomain lookup
CREATE INDEX idx_sites_subdomain ON sites (subdomain);

-- Site content table
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  content_json JSONB DEFAULT '{}'::jsonb,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sites_updated_at
BEFORE UPDATE ON sites
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trigger_site_content_updated_at
BEFORE UPDATE ON site_content
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger for auto-creating profile
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_subdomains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- RLS Policies for Sites
CREATE POLICY "Sites are viewable by owner."
  ON sites FOR SELECT
  USING ( auth.uid() = owner_id );

CREATE POLICY "Published sites are viewable by everyone."
  ON sites FOR SELECT
  USING ( status = 'published' );

CREATE POLICY "Users can insert their own site."
  ON sites FOR INSERT
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "Users can update their own site."
  ON sites FOR UPDATE
  USING ( auth.uid() = owner_id );

CREATE POLICY "Users can delete their own site."
  ON sites FOR DELETE
  USING ( auth.uid() = owner_id );

-- RLS Policies for Site Content
CREATE POLICY "Site content is viewable by owner."
  ON site_content FOR SELECT
  USING ( EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.owner_id = auth.uid()) );

CREATE POLICY "Published site content is viewable by everyone."
  ON site_content FOR SELECT
  USING ( EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.status = 'published') );

CREATE POLICY "Users can insert their own site content."
  ON site_content FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.owner_id = auth.uid()) );

CREATE POLICY "Users can update their own site content."
  ON site_content FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.owner_id = auth.uid()) );

CREATE POLICY "Users can delete their own site content."
  ON site_content FOR DELETE
  USING ( EXISTS (SELECT 1 FROM sites WHERE sites.id = site_content.site_id AND sites.owner_id = auth.uid()) );

-- RLS Policies for Reserved Subdomains
CREATE POLICY "Reserved subdomains are viewable by everyone."
  ON reserved_subdomains FOR SELECT
  USING ( true );

-- Seed reserved subdomains
INSERT INTO reserved_subdomains (word) VALUES
  ('www'), ('api'), ('admin'), ('mail'), ('app'), ('dashboard'), 
  ('blog'), ('cdn'), ('ftp'), ('ns1'), ('ns2'), ('status'), 
  ('support'), ('staging'), ('dev'), ('test');
