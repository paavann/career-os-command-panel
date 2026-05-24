
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  copilot_slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_conv_user ON public.ai_conversations(user_id, copilot_slug, updated_at DESC);
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conv" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conv" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conv" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conv" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all conv" ON public.ai_conversations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_ai_conv BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_msg_conv ON public.ai_messages(conversation_id, created_at);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own msg" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own msg" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own msg" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all msg" ON public.ai_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
