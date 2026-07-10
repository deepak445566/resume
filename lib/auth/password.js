import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** @param {string} plain @returns {Promise<string>} bcrypt hash */
export function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** @param {string} plain @param {string} hash @returns {Promise<boolean>} */
export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}