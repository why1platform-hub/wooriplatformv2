import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aiyhkdhwfmmbkjsxiqim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeWhrZGh3Zm1tYmtqc3hpcWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjI3NDcsImV4cCI6MjA4OTk5ODc0N30.-Z7xsBC82OQfb_iQZ1D6yqFEAgV-xt1lxhglvVH2GSA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
