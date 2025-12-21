#!/usr/bin/env node

/**
 * Migration script to hash plaintext passwords in users.json
 * Run this once to convert plaintext passwords to bcrypt hashes
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = path.join(__dirname, '../config/users.json');
const SALT_ROUNDS = 12;

async function hashPasswords() {
  try {
    // Read current users file
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    const data = JSON.parse(content);

    console.log(`Processing ${data.users.length} users...`);

    // Hash each password
    for (const user of data.users) {
      if (user.password && !user.password.startsWith('$2')) {
        const plaintext = user.password;
        user.password = await bcrypt.hash(plaintext, SALT_ROUNDS);
        console.log(`✓ Hashed password for ${user.email}`);
      }
    }

    // Write back to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log(`\n✓ Successfully hashed all passwords in ${USERS_FILE}`);
    console.log('⚠️  IMPORTANT: Update auth-server to use bcrypt.compare() for password verification');
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

hashPasswords();
