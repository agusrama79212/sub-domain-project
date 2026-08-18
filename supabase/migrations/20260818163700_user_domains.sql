-- Create user_domains table
CREATE TABLE public.user_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;

-- Policies for user_domains
CREATE POLICY "Users can view their own domains" ON public.user_domains
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own domains" ON public.user_domains
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own domains" ON public.user_domains
    FOR DELETE USING (auth.uid() = owner_id);

-- Add updated_at trigger
CREATE TRIGGER handle_user_domains_updated_at BEFORE UPDATE ON public.user_domains
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Update sites table to reference user_domains or store the full domain
ALTER TABLE public.sites
    ADD COLUMN root_domain TEXT DEFAULT 'scrolltubes.xyz';

-- Update RLS for sites
-- (No need to update policies for reading sites since it depends on owner_id)
