import bcrypt from 'bcryptjs';

// DEVELOPMENT MODE: Skip password hashing for testing
const SKIP_PASSWORD_HASH = process.env.SKIP_PASSWORD_HASH === 'true';

export const hashPassword = async (password: string): Promise<string> => {
  // In development mode, store passwords as plain text (TEMPORARY)
  if (SKIP_PASSWORD_HASH) {
    console.warn('⚠️ DEV MODE: Storing passwords as plain text - DO NOT USE IN PRODUCTION');
    return password;
  }
  
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  // In development mode, compare as plain text
  if (SKIP_PASSWORD_HASH) {
    return plainPassword === hashedPassword;
  }
  
  return bcrypt.compare(plainPassword, hashedPassword);
};
