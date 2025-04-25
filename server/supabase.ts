import { createClient } from '@supabase/supabase-js';
import { log } from './vite';

// Supabase configuration
const supabaseUrl = 'https://oifgojcqkhizhleolcjt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZmdvamNxa2hpemhsZW9sY2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzOTE4OTAsImV4cCI6MjA2MDk2Nzg5MH0.UaiTIwaEZ1IJ_Tmv-6e3_5rxKJcApXKi3LBdD9Apfmc';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

log('Supabase client initialized');

// Helper function to check if Supabase connection is working
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      log(`Supabase connection error: ${error.message}`, 'supabase');
      return false;
    }
    
    log('Supabase connection successful', 'supabase');
    return true;
  } catch (err) {
    log(`Supabase connection error: ${err}`, 'supabase');
    return false;
  }
}