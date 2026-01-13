/**
 * Password Migration Utility
 * 
 * This script handles migration of existing insecurely stored passwords
 * to secure Argon2 hashing and provides verification functions.
 */

import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';

// Argon2 configuration for secure password hashing
const ARGON2_OPTIONS = {
  type: argon2.argon2id, // Argon2id is recommended for passwords
  memoryCost: 2 ** 16, // 64 MB memory cost
  timeCost: 3, // 3 iterations
  parallelism: 1, // 1 thread
  hashLength: 32, // 32-byte hash
};

/**
 * Check if a password is using the old insecure format
 * @deprecated This function should only be used for migration, then removed
 */
export function isInsecurePasswordHash(hash: string): boolean {
  return hash.startsWith('hashed_');
}

/**
 * Extract original password from insecure hash (for migration only)
 * @deprecated This function should only be used for one-time migration, then removed
 * @warning This function exposes plaintext passwords and should be used with extreme caution
 */
export function extractInsecurePassword(hash: string): string {
  if (!isInsecurePasswordHash(hash)) {
    throw new Error('Password is not in insecure format');
  }
  // Log security event for audit trail
  console.warn('SECURITY WARNING: Extracting insecure password hash - this should only happen during migration');
  return hash.slice(7); // Remove 'hashed_' prefix
}

/**
 * Hash password using secure Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verify password against hash (handles both old and new formats)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isInsecurePasswordHash(hash)) {
    // Handle migration case: compare with insecure hash
    const originalPassword = extractInsecurePassword(hash);
    return password === originalPassword;
  }
  
  // Verify against Argon2 hash
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Migrate a single user's password to secure hashing
 */
export async function migrateUserPassword(userId: string, newPassword?: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, password: true }
    });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return false;
    }

    // Check if password needs migration
    const currentHash = user.passwordHash || user.password;
    if (!currentHash || !isInsecurePasswordHash(currentHash)) {
      console.log(`User ${userId} already has secure password or no password`);
      return true;
    }

    // If new password provided, use it; otherwise extract from insecure hash
    let passwordToHash: string;
    if (newPassword) {
      passwordToHash = newPassword;
    } else {
      passwordToHash = extractInsecurePassword(currentHash);
      console.warn(`Migrating user ${userId} from insecure password storage - should force password reset`);
    }

    // Hash with Argon2
    const secureHash = await hashPassword(passwordToHash);

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: secureHash,
        password: null, // Clear old insecure password field
        passwordResetRequired: true, // Force password reset for migrated users
        passwordResetToken: generateResetToken(),
        passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    console.log(`Successfully migrated password for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to migrate password for user ${userId}:`, error);
    return false;
  }
}

/**
 * Migrate all users with insecure passwords
 * Returns count of migrated users
 */
export async function migrateAllInsecurePasswords(): Promise<number> {
  try {
    // Find all users with insecure password hashes
    const usersWithInsecurePasswords = await prisma.user.findMany({
      where: {
        OR: [
          { passwordHash: { startsWith: 'hashed_' } },
          { password: { startsWith: 'hashed_' } }
        ]
      },
      select: { id: true, email: true }
    });

    console.log(`Found ${usersWithInsecurePasswords.length} users with insecure passwords`);

    let migratedCount = 0;
    for (const user of usersWithInsecurePasswords) {
      const success = await migrateUserPassword(user.id);
      if (success) {
        migratedCount++;
      }
    }

    console.log(`Successfully migrated ${migratedCount} users to secure password hashing`);
    return migratedCount;
  } catch (error) {
    console.error('Password migration failed:', error);
    return 0;
  }
}

/**
 * Force password reset for users migrated from insecure storage
 */
export async function forcePasswordResetForMigratedUsers(): Promise<number> {
  try {
    const result = await prisma.user.updateMany({
      where: {
        passwordHash: { startsWith: '$argon2' }, // Users with new Argon2 hashes
        passwordResetRequired: { not: true }
      },
      data: {
        passwordResetRequired: true,
        passwordResetToken: generateResetToken(),
        passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    console.log(`Forced password reset for ${result.count} migrated users`);
    return result.count;
  } catch (error) {
    console.error('Failed to force password reset:', error);
    return 0;
  }
}

/**
 * Generate cryptographically secure password reset token
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Run complete migration process
 */
export async function runPasswordMigration(): Promise<{ migratedUsers: number; resetUsers: number }> {
  console.log('Starting password migration process...');
  
  const migratedUsers = await migrateAllInsecurePasswords();
  const resetUsers = await forcePasswordResetForMigratedUsers();
  
  console.log(`Migration complete: ${migratedUsers} users migrated, ${resetUsers} users forced to reset password`);
  
  return { migratedUsers, resetUsers };
}
