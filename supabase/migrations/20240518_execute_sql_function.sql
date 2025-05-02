
-- Create a function to execute arbitrary SQL
-- This is needed for the enableRowLevelSecurity function
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
