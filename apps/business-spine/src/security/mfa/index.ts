/**
 * Multi-Factor Authentication (MFA) Module
 * Handles TOTP-based MFA and recovery codes
 */

import { prisma } from '@/lib/prisma';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

export interface MFASecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerification {
  userId: string;
  token: string;
}

/**
 * Generate MFA secret and QR code for user
 */
export async function generateMFASecret(userId: string, email: string): Promise<MFASecret> {
  // Generate TOTP secret
  const secret = speakeasy.generateSecret({
    name: `Auth-Spine (${email})`,
    length: 32
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

  // Generate backup/recovery codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  return {
    secret: secret.base32 || '',
    qrCode,
    backupCodes
  };
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 steps before/after for clock skew
  });
}

/**
 * Enable MFA for user
 */
export async function enableMFA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaSecret: secret,
      mfaBackupCodes: backupCodes
    }
  });
}

/**
 * Disable MFA for user
 */
export async function disableMFA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: []
    }
  });
}

/**
 * Verify MFA token (TOTP or backup code)
 */
export async function verifyMFAToken(userId: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaBackupCodes: true }
  });

  if (!user || !user.mfaSecret) {
    return false;
  }

  // Try TOTP first
  if (verifyTOTP(user.mfaSecret, token)) {
    return true;
  }

  // Try backup codes
  if (user.mfaBackupCodes && user.mfaBackupCodes.includes(token)) {
    // Remove used backup code
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaBackupCodes: user.mfaBackupCodes.filter(code => code !== token)
      }
    });
    return true;
  }

  return false;
}

/**
 * Get MFA status for user
 */
export async function getMFAStatus(userId: string): Promise<{ enabled: boolean; backupCodesRemaining: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaEnabled: true, mfaBackupCodes: true }
  });

  return {
    enabled: user?.mfaEnabled || false,
    backupCodesRemaining: user?.mfaBackupCodes?.length || 0
  };
}
