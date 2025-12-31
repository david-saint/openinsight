/**
 * Utility for encrypting and decrypting data using the Web Cryptography API.
 * Uses AES-GCM for encryption and PBKDF2 for key derivation.
 */

const ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

/**
 * Generates a CryptoKey from a password.
 */
export const generateKey = async (password: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    KEY_DERIVATION_ALGORITHM,
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: enc.encode('static-salt-for-poc'), // In a real app, use a unique salt
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts data and returns a base64 encoded string containing IV + Ciphertext.
 */
export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    enc.encode(data)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypts data from a base64 encoded string containing IV + Ciphertext.
 */
export const decryptData = async (encryptedBase64: string, key: CryptoKey): Promise<string> => {
  const combined = new Uint8Array(
    atob(encryptedBase64)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const iv = combined.slice(0, IV_SIZE);
  const ciphertext = combined.slice(IV_SIZE);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};