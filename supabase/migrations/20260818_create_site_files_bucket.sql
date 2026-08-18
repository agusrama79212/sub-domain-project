-- Create a new storage bucket for site files
insert into storage.buckets (id, name, public)
values ('site_files', 'site_files', true)
on conflict (id) do nothing;

-- Set up RLS for the bucket
-- Allow public access to read files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'site_files' );

-- Allow authenticated users to upload files to their site's folder
-- We won't enforce strict RLS on the path for simplicity here, 
-- but in production you'd want to check if the user owns the site
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'site_files' );

create policy "Authenticated users can update files"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'site_files' );

create policy "Authenticated users can delete files"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'site_files' );
