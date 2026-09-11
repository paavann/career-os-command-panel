CREATE POLICY "Backend manages members" ON public.members FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages clarity sessions" ON public.clarity_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages authority sessions" ON public.authority_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages reach sessions" ON public.reach_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages evidence entries" ON public.evidence_entries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages energy sessions" ON public.energy_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages energy rewrites" ON public.energy_rewrites FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Backend manages revenue sessions" ON public.revenue_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);