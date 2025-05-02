
-- Create function to alter table replica identity
CREATE OR REPLACE FUNCTION public.alter_table_replica_identity(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
END;
$$;

-- Create function to add table to publication
CREATE OR REPLACE FUNCTION public.add_table_to_publication(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
END;
$$;

-- Enable realtime for buddy_connections table
ALTER TABLE public.buddy_connections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.buddy_connections;

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
