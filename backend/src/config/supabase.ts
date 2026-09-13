import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey)) {
  try {
    if (supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      });
    }

    if (supabaseServiceRoleKey) {
      supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
    }
    logger.info('Supabase client initialized successfully');
  } catch (error) {
    logger.warn({ err: error }, 'Supabase client initialization warning');
  }
} else {
  logger.info('Supabase API credentials not fully configured; operating with Prisma database connection');
}

export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient || supabaseClient;
