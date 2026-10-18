
import "server-only";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 8;

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("A senha deve ter pelo menos 8 caracteres.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
