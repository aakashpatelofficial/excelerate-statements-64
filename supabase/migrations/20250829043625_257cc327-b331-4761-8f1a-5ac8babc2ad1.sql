-- Create storage policies for bank statements bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bank-statements-uploaded');

CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'bank-statements-uploaded');

CREATE POLICY "Allow authenticated users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'bank-statements-uploaded');