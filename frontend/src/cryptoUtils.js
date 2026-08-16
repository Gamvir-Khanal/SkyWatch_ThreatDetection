const PSK  = import.meta.env.VITE_SKYWATCH_PSK ?? 'SkyWatch-Tactical-PSK-v1-CHANGE-IN-PROD';
const SALT = new TextEncoder().encode('SkyWatch-PBKDF2-Salt-2026');
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
// ─── Key derivation (cached) ─────────────────────────────────────────────────
/** Derive encKey (AES-256-CBC) and authKey (HMAC-SHA256) from the PSK once. */
const keysPromise = (async () => {
  const subtle = window.crypto.subtle;
  // Import raw PSK bytes
  const rawPsk = new TextEncoder().encode(PSK);
  const baseKey = await subtle.importKey(
    'raw', rawPsk,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const masterBits = await subtle.deriveBits(
    { name: 'PBKDF2', salt: SALT, iterations: 310_000, hash: 'SHA-256' },
    baseKey,
    512,
  );
  const master = new Uint8Array(masterBits);
  const encKey = await subtle.importKey(
    'raw', master.slice(0, 32),
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt'],
  );
  const authKey = await subtle.importKey(
    'raw', master.slice(32, 64),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return { encKey, authKey };
})();
export async function encrypt(plainObj) {
  const { encKey, authKey } = await keysPromise;
  const subtle = window.crypto.subtle;
  const iv        = window.crypto.getRandomValues(new Uint8Array(16));
  const plaintext = new TextEncoder().encode(JSON.stringify(plainObj));
  const ciphertextBuf = await subtle.encrypt(
    { name: 'AES-CBC', iv },
    encKey,
    plaintext,
  );
  const ivAndCipher = new Uint8Array(iv.byteLength + ciphertextBuf.byteLength);
  ivAndCipher.set(iv, 0);
  ivAndCipher.set(new Uint8Array(ciphertextBuf), iv.byteLength);
  const macBuf = await subtle.sign('HMAC', authKey, ivAndCipher);
  return {
    _enc      : true,
    iv        : bytesToHex(iv),
    ciphertext: bytesToHex(ciphertextBuf),
    hmac      : bytesToHex(macBuf),
  };
}
export async function decrypt(envelope) {
  if (!envelope || envelope._enc !== true) {
    console.error('[CRYPTO] Envelope missing _enc sentinel — cannot decrypt.', envelope);
    return null;
  }
  try {
    const { encKey, authKey } = await keysPromise;
    const subtle = window.crypto.subtle;
    const iv            = hexToBytes(envelope.iv);
    const ciphertextArr = hexToBytes(envelope.ciphertext);
    const receivedMac   = hexToBytes(envelope.hmac);
    const ivAndCipher = new Uint8Array(iv.byteLength + ciphertextArr.byteLength);
    ivAndCipher.set(iv, 0);
    ivAndCipher.set(ciphertextArr, iv.byteLength);
    const valid = await subtle.verify('HMAC', authKey, receivedMac, ivAndCipher);
    if (!valid) {
      console.error('[CRYPTO] HMAC verification failed — message may be tampered.');
      return null;
    }
    const plainBuf = await subtle.decrypt(
      { name: 'AES-CBC', iv },
      encKey,
      ciphertextArr,
    );
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch (err) {
    console.error('[CRYPTO] Decryption error:', err);
    return null;
  }
}
