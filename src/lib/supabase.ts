import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://untqycddahzrkndmbfhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudHF5Y2RkYWh6cmtuZG1iZmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDUyMjMsImV4cCI6MjA3ODk4MTIyM30.cxUEKpmY3oj0HCZAvHxLqCta2KsIDw9pabPH1iWkWwI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
