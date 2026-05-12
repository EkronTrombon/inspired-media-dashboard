#!/usr/bin/env node
// Hash a password with bcryptjs (10 rounds) and print the result.
// Usage:  node scripts/hash-password.mjs <password>

import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
