/**
 * @vitest-environment node
 * 
 * This test verifies Prisma client can be initialized and connect to Neon database.
 * For connection tests, DATABASE_URL must be set in environment variables.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../client';

describe('Prisma Client (Neon)', () => {
  beforeAll(() => {
    // Fail fast if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL must be set in environment variables for connection tests. ' +
        'Create a .env.local file with your Neon database connection string.'
      );
    }

    // Validate connection string format
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
    }
  });

  it('should initialize Prisma client', () => {
    expect(prisma).toBeDefined();
    expect(prisma).toHaveProperty('$connect');
    expect(prisma).toHaveProperty('$disconnect');
  });

  it('should have Prisma client methods', () => {
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('should be able to connect to Neon database', async () => {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    // Try to connect
    try {
      await prisma.$connect();
      
      // Test a simple query to verify connection works
      await prisma.$queryRaw`SELECT 1 as test`;
      
      await prisma.$disconnect();
      expect(true).toBe(true); // Connection successful
    } catch (error: any) {
      // Connection failed
      await prisma.$disconnect().catch(() => {});
      throw new Error(
        `Failed to connect to Neon database: ${error.message}. Check your DATABASE_URL.`
      );
    }
  }, 15000);
});

