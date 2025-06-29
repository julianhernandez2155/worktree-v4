-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view organization logos (public bucket)
CREATE POLICY "Organization logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'org-logos');

-- Policy: Organization admins can upload logos
CREATE POLICY "Organization admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-logos' 
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'president', 'vice_president', 'treasurer', 'secretary')
  )
);

-- Policy: Organization admins can update logos
CREATE POLICY "Organization admins can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-logos' 
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'president', 'vice_president', 'treasurer', 'secretary')
  )
);

-- Policy: Organization admins can delete logos
CREATE POLICY "Organization admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-logos' 
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id::text = (storage.foldername(name))[1]
    AND om.user_id = auth.uid()
    AND om.role IN ('admin', 'president', 'vice_president', 'treasurer', 'secretary')
  )
);