
-- Create function to alter table replica identity
CREATE OR REPLACE FUNCTION supabase_functions.alter_table_replica_identity(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', table_name);
END;
$$;

-- Create function to add table to publication
CREATE OR REPLACE FUNCTION supabase_functions.add_table_to_publication(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
END;
$$;

-- Create function to setup_chat_policies
CREATE OR REPLACE FUNCTION public.setup_chat_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be expanded to set up policies for chats and other functionality
  RETURN;
END;
$$;

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
