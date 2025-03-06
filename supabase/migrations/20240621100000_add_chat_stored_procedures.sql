
-- Create stored procedure for chat session creation
CREATE OR REPLACE FUNCTION public.create_chat_session(p_user_id UUID, p_product_id UUID)
RETURNS TABLE (id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_session_id UUID;
BEGIN
  INSERT INTO public.chat_sessions (user_id, product_id)
  VALUES (p_user_id, p_product_id)
  RETURNING chat_sessions.id INTO new_session_id;
  
  RETURN QUERY SELECT new_session_id;
END;
$$;

-- Create stored procedure for saving chat messages
CREATE OR REPLACE FUNCTION public.save_chat_messages(p_messages JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.chat_messages (chat_session_id, content, sender, timestamp)
  SELECT 
    (jsonb_array_elements(p_messages)->>'chat_session_id')::UUID,
    jsonb_array_elements(p_messages)->>'content',
    (jsonb_array_elements(p_messages)->>'sender')::TEXT,
    (jsonb_array_elements(p_messages)->>'timestamp')::TIMESTAMP WITH TIME ZONE
  ON CONFLICT DO NOTHING;
END;
$$;

-- Add RLS policies for the stored procedures
GRANT EXECUTE ON FUNCTION public.create_chat_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.save_chat_messages TO authenticated, anon;
