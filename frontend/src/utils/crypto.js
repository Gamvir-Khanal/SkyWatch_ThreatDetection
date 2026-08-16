const DEFAULT_KEY = '536b7957617463682d546163746963616c2d4145532d3235362d47434d2d4b65';
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
const keyPromise = (async () => {
  const keyHex = import.meta.env.VITE_COMM_SECRET_KEY || DEFAULT_KEY;
  const keyBytes = hexToBytes(keyHex);
  return window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
})();
export async function decryptPayload(envelope) {
  if (!envelope || envelope._enc !== true) {
    console.error('[CRYPTO] Envelope missing _enc sentinel — cannot decrypt.', envelope);
    return null;
  }
  try {
    const key = await keyPromise;
    const iv = hexToBytes(envelope.iv);
    const ciphertext = hexToBytes(envelope.ciphertext);
    const authTag = hexToBytes(envelope.authTag);
    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      combined
    );
    return JSON.parse(new TextDecoder().decode(decryptedBuffer));
  } catch (err) {
    console.error('[CRYPTO] Decryption/Authentication error:', err);
    return null;
  }
}
