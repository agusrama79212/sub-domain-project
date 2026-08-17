ALTER TABLE sites
ADD CONSTRAINT sites_custom_domain_key UNIQUE (custom_domain);
