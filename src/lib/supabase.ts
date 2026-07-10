import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ybsuoytcwmoapvrunaog.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlic3VveXRjd21vYXB2cnVuYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjQyMjAsImV4cCI6MjA5OTIwMDIyMH0.glGVgrMaf0jBOj-lfU0wHJXdhh5VZvyukYDuBxzmnO8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
