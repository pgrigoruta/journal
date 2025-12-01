/**
 * @vitest-environment node
 * 
 * This test verifies Prisma client can be initialized.
 * For connection tests, DATABASE_URL must be set in environment variables.
 */

import { describe, it, expect } from 'vitest';
import { prisma } from '../client';

describe('Prisma Client', () => {
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

  it('should be able to connect to database if DATABASE_URL is set', async () => {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      // Skip test if DATABASE_URL is not set
      expect(databaseUrl).toBeUndefined();
      return;
    }

    // Try to connect
    try {
      await prisma.$connect();
      await prisma.$disconnect();
      expect(true).toBe(true); // Connection successful
    } catch (error: any) {
      // Connection failed - this is expected if DATABASE_URL is invalid
      expect(error).toBeDefined();
      throw new Error(
        `Failed to connect to database: ${error.message}. Check your DATABASE_URL.`
      );
    }
  }, 10000);
});

