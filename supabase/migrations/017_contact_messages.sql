-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- unread, read, replied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a contact message (even anonymous users)
CREATE POLICY "Anyone can insert contact_messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view and manage contact messages
CREATE POLICY "Admins can manage contact_messages" 
ON public.contact_messages 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add to publications so realtime works for admins if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
