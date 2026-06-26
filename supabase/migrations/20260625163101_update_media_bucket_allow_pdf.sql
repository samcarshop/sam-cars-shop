UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/*', 'video/mp4', 'video/webm', 'application/pdf', 'application/octet-stream']
WHERE id = 'media';
