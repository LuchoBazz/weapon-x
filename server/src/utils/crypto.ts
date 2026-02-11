import crypto from 'crypto';

const secretKey = process.env.ENCRYPTION_KEY ?? 'default_secret_key_32_chars!';
const encryptionIv = process.env.ENCRYPTION_IV ?? 'default_iv_16_ch';

const key = Buffer.alloc(32);
Buffer.from(secretKey, 'utf8').copy(key);

const iv = Buffer.alloc(16);
Buffer.from(encryptionIv, 'utf8').copy(iv);

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
