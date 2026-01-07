#!/usr/bin/env node

/**
 * Migration script to hash plaintext passwords in users.json
 * Run this once to convert plaintext passwords to bcrypt hashes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = path.join(__dirname, '../config/users.json');
const SALT_ROUNDS = 12;

interface User {
  email: string;
  password: string;
  [key: string]: any;
}

interface UsersData {
  users: User[];
}

async function hashPasswords(): Promise<void> {
  try {
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    const data: UsersData = JSON.parse(content);

    console.log(`Processing ${data.users.length} users...`);

    for (const user of data.users) {
      if (user.password && !user.password.startsWith('$2')) {
        const plaintext = user.password;
        user.password = await bcrypt.hash(plaintext, SALT_ROUNDS);
        console.log(`✓ Hashed password for ${user.email}`);
      }
    }

    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`\n✓ Successfully hashed all passwords in ${USERS_FILE}`);
    console.log('⚠️  IMPORTANT: Update auth-server to use bcrypt.compare() for password verification');
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

hashPasswords();
