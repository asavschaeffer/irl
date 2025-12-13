import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import config from '@app-launch-kit/config';
import { Platform } from 'react-native';

// import { Database } from '../../../apps/supabase/supabase/types_db';

const configuredSupabaseUrl = config.env.supabase.URL ?? '';
const configuredSupabaseAnonKey = config.env.supabase.ANON_KEY ?? '';

const supabaseUrl = configuredSupabaseUrl.trim();
const supabaseAnonKey = configuredSupabaseAnonKey.trim();

if (supabaseUrl === '' || supabaseAnonKey === '') {
  // Fail fast with a clear message (better than "@supabase/supabase-js: supabaseUrl is required")
  // eslint-disable-next-line no-console
  console.error('[Supabase] Missing env vars', {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      ? '(set)'
      : '(missing)',
  });
  throw new Error(
    'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in frontend/apps/expo/.env, then restart Expo with --clear.'
  );
}

export const client = createClient(
  // <Database>
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
