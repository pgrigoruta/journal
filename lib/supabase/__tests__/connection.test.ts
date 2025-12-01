/**
 * @vitest-environment node
 * 
 * This test file requires real Supabase credentials and will fail if:
 * - Environment variables are not set
 * - Connection to Supabase cannot be established
 * - Credentials are invalid
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Use real environment variables - test will fail if not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Supabase Connection', () => {
  beforeAll(() => {
    // Fail fast if environment variables are not set
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables. ' +
        'Create a .env.local file with your Supabase credentials.'
      );
    }
    
    // Validate URL format
    if (!supabaseUrl.startsWith('https://')) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
    }
    
    if (!supabaseUrl.includes('.supabase.co')) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL');
    }
  });

  it('should have valid environment variables configured', () => {
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseAnonKey).toBeTruthy();
    expect(supabaseUrl).toMatch(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/);
    expect(supabaseAnonKey.length).toBeGreaterThan(20); // Anon keys are typically long
  });

  it('should successfully connect to Supabase API', async () => {
    const client = createClient(supabaseUrl!, supabaseAnonKey!);
    
    // Make a real API call to verify connection
    // Querying a non-existent table will return an error, but confirms connectivity
    const result = await client.from('_connection_test_table_does_not_exist').select('*').limit(0);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
    
    // If we get an error, check if it's a connection error or just a table not found error
    if (result.error) {
      const errorMessage = result.error.message.toLowerCase();
      const errorCode = result.error.code;
      
      // Connection/network errors indicate failure
      const isConnectionError = 
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('enotfound') ||
        errorMessage.includes('econnrefused') ||
        errorCode === 'PGRST116' || // PostgREST connection error
        errorCode === 'PGRST301';   // PostgREST timeout
      
      if (isConnectionError) {
        throw new Error(
          `Failed to connect to Supabase: ${result.error.message} (Code: ${errorCode})`
        );
      }
      
      // Authentication errors also indicate connection issues
      if (errorCode === 'PGRST301' || errorMessage.includes('invalid api key')) {
        throw new Error(
          `Supabase authentication failed: ${result.error.message}. Check your NEXT_PUBLIC_SUPABASE_ANON_KEY.`
        );
      }
      
      // Table not found (PGRST116 or similar) is acceptable - means connection works
      // Other errors might be acceptable too, but connection is established
    }
  }, 20000);

  it('should be able to reach Supabase REST API endpoint', async () => {
    // Test REST API endpoint directly using native fetch (works in node environment)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey!,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Should get a response (even if 404, means server is reachable)
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
      
      if (response.status >= 500) {
        throw new Error(`Supabase server error: ${response.status} ${response.statusText}`);
      }
      
      // 401/403 might indicate auth issues, but connection works
      // 404 is fine - endpoint doesn't exist but server responded
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Connection to Supabase timed out. Check your network and Supabase URL.');
      }
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot reach Supabase server at ${supabaseUrl}. Check your NEXT_PUBLIC_SUPABASE_URL.`
        );
      }
      
      throw error;
    }
  }, 20000);

  it('should be able to authenticate with Supabase', async () => {
    const client = createClient(supabaseUrl!, supabaseAnonKey!);
    
    // Test authentication endpoint
    const result = await client.auth.getSession();
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');
    
    // Should not have connection errors
    if (result.error) {
      const errorMessage = result.error.message?.toLowerCase() || '';
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')
      ) {
        throw new Error(`Supabase authentication endpoint unreachable: ${result.error.message}`);
      }
    }
  }, 20000);
});

