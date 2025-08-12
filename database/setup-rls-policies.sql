-- =============================================================================
-- RLS (Row Level Security) Policies for Deals Table
-- =============================================================================
-- This script sets up comprehensive Row Level Security policies for the 'deals' 
-- table to enable seamless CRUD operations from the frontend application.
--
-- Run this script in your Supabase SQL editor or via psql to resolve
-- permission issues when creating, reading, updating, or deleting deals.
-- =============================================================================

-- Enable RLS on the deals table
-- This enforces that all queries must pass through our defined policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLICY 1: Allow authenticated users to SELECT (read) all deals
-- =============================================================================
-- This policy allows any authenticated user to view all deals in the system.
-- Adjust the USING clause if you need more granular read permissions.

DROP POLICY IF EXISTS "Allow authenticated users to view deals" ON deals;

CREATE POLICY "Allow authenticated users to view deals"
ON deals FOR SELECT
TO authenticated
USING (true);

-- =============================================================================
-- POLICY 2: Allow authenticated users to INSERT (create) new deals
-- =============================================================================
-- This policy allows any authenticated user to create new deals.
-- The WITH CHECK clause can be used to add validation on inserted data.

DROP POLICY IF EXISTS "Allow authenticated users to create deals" ON deals;

CREATE POLICY "Allow authenticated users to create deals"
ON deals FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================================================
-- POLICY 3: Allow authenticated users to UPDATE (edit) existing deals
-- =============================================================================
-- This policy allows any authenticated user to update any deal.
-- USING clause: Controls which rows can be updated
-- WITH CHECK clause: Controls what the updated data can be

DROP POLICY IF EXISTS "Allow authenticated users to update deals" ON deals;

CREATE POLICY "Allow authenticated users to update deals"
ON deals FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================================================
-- POLICY 4: Allow authenticated users to DELETE deals
-- =============================================================================
-- This policy allows any authenticated user to delete any deal.
-- Adjust the USING clause if you need more granular delete permissions.

DROP POLICY IF EXISTS "Allow authenticated users to delete deals" ON deals;

CREATE POLICY "Allow authenticated users to delete deals"
ON deals FOR DELETE
TO authenticated
USING (true);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries to verify the policies were created successfully

-- Check if RLS is enabled on the deals table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'deals' AND schemaname = 'public';

-- List all policies on the deals table
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'deals' AND schemaname = 'public'
ORDER BY policyname;

-- =============================================================================
-- OPTIONAL: More Restrictive Policies (Commented Out)
-- =============================================================================
-- If you need more granular control in the future, you can replace the above
-- policies with these more restrictive examples:

/*
-- Example: User can only see their own deals (if you add a user_id column)
CREATE POLICY "Users can view their own deals"
ON deals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Example: Only specific roles can delete deals
CREATE POLICY "Only admins can delete deals"
ON deals FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Example: Prevent updates to certain fields
CREATE POLICY "Restrict updates to certain fields"
ON deals FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
    deal_uuid = OLD.deal_uuid AND 
    criado_em = OLD.criado_em
);
*/

-- =============================================================================
-- GRANT PERMISSIONS (if needed)
-- =============================================================================
-- Ensure the authenticated role has the necessary table permissions
-- These are usually granted by default, but included for completeness

GRANT SELECT, INSERT, UPDATE, DELETE ON deals TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================
DO $$ 
BEGIN 
    RAISE NOTICE 'RLS policies for deals table have been successfully created!';
    RAISE NOTICE 'Your frontend application should now have full CRUD access to deals.';
    RAISE NOTICE 'Check the verification queries above to confirm policy creation.';
END $$;