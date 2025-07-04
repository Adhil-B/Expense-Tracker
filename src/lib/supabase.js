import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://loxzlhohdidyucrtmsbw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveHpsaG9oZGlkeXVjcnRtc2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTM5MTEsImV4cCI6MjA2NzE4OTkxMX0.3jbwnmlQHUaO5KC6WZ98gZkHdnaMUDi8-r-aDeH--QI'
); 