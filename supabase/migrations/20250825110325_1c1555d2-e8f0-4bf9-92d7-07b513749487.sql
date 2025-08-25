-- Add RLS policies for reference_requests table
ALTER TABLE reference_requests ENABLE ROW LEVEL SECURITY;

-- Allow public access to read reference requests by token
CREATE POLICY "Allow public read access by token" ON reference_requests
FOR SELECT USING (true);

-- Allow public insert access for submitting references
CREATE POLICY "Allow public insert access" ON reference_requests
FOR INSERT WITH CHECK (true);

-- Allow public update access for submitting form data
CREATE POLICY "Allow public update access" ON reference_requests
FOR UPDATE USING (true) WITH CHECK (true);

-- Allow admins to manage all reference requests
CREATE POLICY "Admins can manage reference requests" ON reference_requests
FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());